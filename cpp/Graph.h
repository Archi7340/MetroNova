#pragma once
#include <unordered_map>
#include <vector>
#include <string>
#include <unordered_set>
#include <limits>
#include <queue>
#include <stack>
#include <functional>
using namespace std;

struct Station {
    int id;
    string name;
    string line;
    bool interchange;
    double x, y;
};

struct Edge {
    int to;
    int weight;
};

struct PathResult {
    vector<int> path;
    int totalWeight;
    bool found;
};

class Graph {
public:
    unordered_map<int, Station> stations;
    unordered_map<int, vector<Edge>> adjList;

    void addStation(const Station& s);
    void addEdge(int from, int to, int weight);

    // Algorithms
    PathResult dijkstra(int src, int dest) const;
    PathResult bfs(int src, int dest) const;
    vector<int> dfsReachable(int start) const;
    vector<int> getInterchanges() const;
    bool isConnected() const;
    int countComponents() const;

    // Fare calculation (DMRC slab system)
    int calculateFare(int totalWeightSeconds) const;

    // Helpers
    bool hasStation(int id) const;
    vector<int> getNeighbors(int id) const;
};