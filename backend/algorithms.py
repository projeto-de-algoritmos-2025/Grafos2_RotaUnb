import heapq
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
    
def dijkstra(graph, start):
        distances = {v: float('infinity') for v in graph.vertices}
        previous_nodes = {v: None for v in graph.vertices}
        distances[start] = 0
        
        priority_queue = [(0, start)]
        
        while priority_queue:
            current_dist, current_vertex = heapq.heappop(priority_queue)
            
            if current_dist > distances[current_vertex]:
                continue
            
            for neighbor, weight in graph.get_neighbors(current_vertex):
                distance = current_dist + weight
                
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    previous_nodes[neighbor] = current_vertex
                    heapq.heappush(priority_queue, (distance, neighbor))
        
        return previous_nodes, distances