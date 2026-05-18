import networkx as nx
from itertools import islice


def generate_k_shortest_paths(graph: nx.DiGraph, k_paths: int, demands: list) -> list:
    all_paths_data = []
    for demand in demands:
        try:
            paths_generator = nx.shortest_simple_paths(graph, demand.source, demand.target, weight='weight')
            k_shortest = list(islice(paths_generator, k_paths))
            for idx, node_path in enumerate(k_shortest):
                # [1, 5, 3] -> (1, 5), (5, 3)
                node_pairs  = list(zip(node_path, node_path[1:]))

                path_edge_ids = []
                path_total_weight = 0

                for u, v in node_pairs:
                    edge_data = graph[u][v]
                    path_edge_ids.append(edge_data['id'])
                    path_total_weight += edge_data['weight']

                all_paths_data.append({
                    "id": f"{demand.id}-{idx}",
                    "demand_id": demand.id,
                    "nodes": node_path,
                    "edge_ids": path_edge_ids,
                    "length": len(path_edge_ids),
                    "weight": path_total_weight,
                })
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            continue

    return all_paths_data

#for cpla
def generate_shortest_paths_by_weights(graph: nx.DiGraph, demands: list, edge_weights: dict) -> list:
    new_paths = []

    for u, v, data in graph.edges(data=True):
        edge_id = data['id']
        graph[u][v]['dynamic_weight'] = edge_weights.get(edge_id, data.get('weight', 1.0) + 1e-4)

    for demand in demands:
        try:
            node_path = nx.shortest_path(graph, source=demand.source, target=demand.target, weight='dynamic_weight')
            node_pairs = list(zip(node_path, node_path[1:]))

            path_edge_ids = []
            path_total_weight = 0

            for u, v in node_pairs:
                edge_data = graph[u][v]
                path_edge_ids.append(edge_data['id'])
                path_total_weight += edge_data.get('weight', 1.0)  # Сохраняем физический вес, а не динамический!

            new_paths.append({
                "demand_id": demand.id,
                "nodes": node_path,
                "edge_ids": path_edge_ids,
                "length": len(path_edge_ids),
                "weight": path_total_weight,
            })
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            continue

    return new_paths
