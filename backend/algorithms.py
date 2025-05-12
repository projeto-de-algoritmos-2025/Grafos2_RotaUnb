class Graph:
    def __init__(self):
        self.vertices = {}
    
    def add_vertex(self, vertex):
        if vertex not in self.vertices:
            self.vertices[vertex] = {}
    
    def add_edge(self, u, v, weight):
        if u in self.vertices and v in self.vertices:
            self.vertices[u][v] = weight
            self.vertices[v][u] = weight
    
    def get_neighbors(self, vertex):
        return self.vertices.get(vertex, {}).items()