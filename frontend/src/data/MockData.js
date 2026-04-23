export const mockNetwork = {
    nodes : [
        {id: '1', label: '1'},
        {id: '2', label: '2'},
        {id: '3', label: '3'},
        {id: '4', label: '4'},
        {id: '5', label: '5'},
        {id: '6', label: '6'},
        {id: '7', label: '7'},
        {id: '8', label: '8'},
        {id: '9', label: '9'},
        {id: '10', label: '10'},
        {id: '11', label: '11'},
        {id: '12', label: '12'},
        {id: '13', label: '13'},
        {id: '14', label: '14'},
        {id: '15', label: '15'},
        {id: '16', label: '16'},
        {id: '17', label: '17'}
    ],
    edges : [
        {id:'1-2', source: '1', target: '2', weight: 1, capacity: 10},
        {id:'1-3', source: '1', target: '3', weight: 3, capacity: 10},
        {id:'2-3', source: '2', target: '3', weight: 1, capacity: 10},
        {id:'2-4', source: '2', target: '4', weight: 2, capacity: 10},
        {id:'2-5', source: '2', target: '5', weight: 2, capacity: 10},
        {id:'3-4', source: '3', target: '4', weight: 1, capacity: 10},
        {id:'3-6', source: '3', target: '6', weight: 1, capacity: 10},
        {id:'4-5', source: '4', target: '5', weight: 1, capacity: 10},
        {id:'6-4', source: '6', target: '4', weight: 2, capacity: 10},
        {id:'4-8', source: '4', target: '8', weight: 2, capacity: 10},
        {id:'5-8', source: '5', target: '8', weight: 2, capacity: 10},
        {id:'6-8', source: '6', target: '8', weight: 2, capacity: 10},
        {id:'5-7', source: '5', target: '7', weight: 10, capacity: 10},
        {id:'5-9', source: '5', target: '9', weight: 1, capacity: 10},
        {id:'6-10', source: '6', target: '10', weight: 2, capacity: 10},
        {id:'8-9', source: '8', target: '9', weight: 1, capacity: 10},
        {id:'8-10', source: '8', target: '10', weight: 2, capacity: 10},
        {id:'8-11', source: '8', target: '11', weight: 1, capacity: 10},
        {id:'9-11', source: '9', target: '11', weight: 1, capacity: 10},
        {id:'10-11', source: '10', target: '11', weight: 2, capacity: 10},
        {id:'10-12', source: '10', target: '12', weight: 10, capacity: 10},
        {id:'11-13', source: '11', target: '13', weight: 1, capacity: 10},
        {id:'13-14', source: '13', target: '14', weight: 1, capacity: 10},
        {id:'14-15', source: '14', target: '15', weight: 1, capacity: 10},
        {id:'15-16', source: '15', target: '16', weight: 1, capacity: 10},
        {id:'16-17', source: '16', target: '17', weight: 1, capacity: 10},
        {id:'11-17', source: '11', target: '17', weight: 5, capacity: 10},
    ]
};

export const mockResult = {
    objective: 14,
    paths: [
        {
            demandId: "d1",
            path: ["1","2","4"],
            flow: 4
        },
        {
            demandId: "d2",
            path: ["1","3","4"],
            flow: 3
        }
    ],
    edgeLoads: [
        { edgeId: '1-2', load: 4, capacity: 10, utilization: 0.4, pi: 0 },
        { edgeId: '1-3', load: 3, capacity: 8, utilization: 0.375, pi: 0 },
        { edgeId: '2-4', load: 4, capacity: 7, utilization: 0.57, pi: 0.2 },
        { edgeId: '3-4', load: 3, capacity: 6, utilization: 0.5, pi: 0.1 },
        { edgeId: '2-3', load: 1, capacity: 5, utilization: 0.2, pi: 0 }
    ]
}