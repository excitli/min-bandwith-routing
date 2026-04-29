import pyomo.environ as pyo
from typing import Any, List, Dict
from collections import defaultdict
from backend.app.schemas.optimize import RoutingType, OptimizationObjective


def solve_routing(
    edges: List[Any],
    demands: List[Any],
    paths: List[Dict[str, Any]],
    routing_type: RoutingType,
    objective_type: OptimizationObjective,
):
    demand_traffic = {d.id: d.traffic for d in demands}
    edges_throughput = {e.id: e.capacity for e in edges}

    paths_by_demand = defaultdict(list)
    paths_by_edge = defaultdict(list)
    path_data = {}

    for p in paths:
        p_id = p['id']
        path_data[p_id] = p
        paths_by_demand[p['demand_id']].append(p_id)
        for e_id in p['edge_ids']:
            paths_by_edge[e_id].append(p_id)

    model = pyo.ConcreteModel(name="Min-max Bandwidth")

    model.DEMANDS = pyo.Set(initialize=demand_traffic.keys())
    model.EDGES = pyo.Set(initialize=edges_throughput.keys())
    model.PATHS = pyo.Set(initialize=path_data.keys())

    if routing_type == RoutingType.BIFURCATED:
        model.x = pyo.Var(model.PATHS, domain=pyo.NonNegativeReals)
    elif routing_type == RoutingType.NON_BIFURCATED:
        model.y = pyo.Var(model.PATHS, domain=pyo.Binary)
    elif routing_type == RoutingType.INTEGRAL:
        model.x = pyo.Var(model.PATHS, domain=pyo.NonNegativeIntegers)
    if objective_type == OptimizationObjective.MAX_FREE_CAP:
        model.u_u = pyo.Var(domain=pyo.Reals)


    #constraints
    @model.Constraint(model.DEMANDS)
    def demand_rule(m, d_id):
        path_ids = paths_by_demand.get(d_id, [])

        if not path_ids:
            raise ValueError(f"No paths have been found for demand: {d_id}. Optimization is impossible.")

        if routing_type == RoutingType.NON_BIFURCATED:
            return sum(m.y[p_id] for p_id in paths_by_demand[d_id]) == 1
        else:
            return sum(m.x[p_id] for p_id in paths_by_demand[d_id]) == demand_traffic[d_id]

    @model.Constraint(model.EDGES)
    def capacity_rule(m, e_id):
        if routing_type == RoutingType.NON_BIFURCATED:
            current_flow = sum(m.y[p_id] * demand_traffic[path_data[p_id]['demand_id']]
                               for p_id in paths_by_edge[e_id])
        else:
            current_flow = sum(m.x[p_id] for p_id in paths_by_edge[e_id])

        if objective_type == OptimizationObjective.MAX_FREE_CAP:
            return current_flow <= edges_throughput[e_id] - m.u_u
        else:
            return current_flow <= edges_throughput[e_id]


    if objective_type == OptimizationObjective.MIN_BANDWITH:
        def obj_min(m):
            if routing_type == RoutingType.NON_BIFURCATED:
                return sum(m.y[p_id] * demand_traffic[path_data[p_id]['demand_id']] * path_data[p_id]['length']
                           for p_id in m.PATHS)
            else:
                return sum(m.x[p_id] * path_data[p_id]['length'] for p_id in m.PATHS)
        model.obj = pyo.Objective(rule=obj_min, sense=pyo.minimize)

    elif objective_type == OptimizationObjective.MAX_FREE_CAP:
        model.obj = pyo.Objective(expr=model.u_u, sense=pyo.maximize)

    if routing_type == RoutingType.BIFURCATED:
        model.dual = pyo.Suffix(direction=pyo.Suffix.IMPORT)

    solver = pyo.SolverFactory('glpk')
    results = solver.solve(model)

    output_paths = []
    for p_id in model.PATHS:
        val = 0
        if routing_type == RoutingType.NON_BIFURCATED:
            if pyo.value(model.y[p_id]) > 0.5:
                val = demand_traffic[path_data[p_id]['demand_id']]
        else:
            val = pyo.value(model.x[p_id])
        if val > 0:
            output_paths.append({
                "path_id": p_id,
                "flow": val,
                "nodes": path_data[p_id]['nodes'],
            })

    duals = {}
    if routing_type == RoutingType.BIFURCATED and hasattr(model, 'dual'):
        duals = {
            "edges": {e_id: model.dual[model.capacity_rule[e_id]] for e_id in model.EDGES},
            "demands": {d_id: model.dual[model.demand_rule[d_id]] for d_id in model.DEMANDS}
        }

    return {
        "status": str(results.solver.status),
        "objective_value": pyo.value(model.obj),
        "paths": output_paths,
        "duals": duals,
    }