#include "Graph.h"
#include <algorithm>
using namespace std;

void Graph::addStation(const Station& s) {
    stations[s.id] = s;
    if (adjList.find(s.id) == adjList.end())
        adjList[s.id] = {};
}

void Graph::addEdge(int from, int to, int weight) {
    adjList[from].push_back({to, weight});
    adjList[to].push_back({from, weight}); // undirected
}

bool Graph::hasStation(int id) const {
    return stations.find(id) != stations.end();
}

    vector<int> Graph::getNeighbors(int id) const {
    vector<int> result;
    auto it = adjList.find(id);
    if (it != adjList.end())
        for (auto& e : it->second)
            result.push_back(e.to);
    return result;
}

// ─── Dijkstra (shortest travel time) ──────────────────────────────────────────
PathResult Graph::dijkstra(int src, int dest) const {
    const int INF = std::numeric_limits<int>::max();
    unordered_map<int, int> dist;
    unordered_map<int, int> prev;

    for (auto& pair : stations) {
    int id = pair.first;
    dist[id] = INF;
    prev[id] = -1;
}
    dist[src] = 0;

    // min-heap: {dist, nodeId}
    priority_queue<
    pair<int,int>,
    vector<pair<int,int>>,
    greater<pair<int,int>>
> pq;
    pq.push({0, src});

    while (!pq.empty()) {
       auto top = pq.top();
       pq.pop();
       int d = top.first;
       int u = top.second;
        if (d > dist[u]) continue;
        if (u == dest) break;

        auto it = adjList.find(u);
        if (it == adjList.end()) continue;
        for (auto& e : it->second) {
            int newDist = dist[u] + e.weight;
            if (newDist < dist[e.to]) {
                dist[e.to] = newDist;
                prev[e.to] = u;
                pq.push({newDist, e.to});
            }
        }
    }

    PathResult result;
    result.found = (dist[dest] != INF);
    result.totalWeight = result.found ? dist[dest] : -1;

    if (result.found) {
        for (int v = dest; v != -1; v = prev[v])
            result.path.push_back(v);
        reverse(result.path.begin(), result.path.end());
    }
    return result;
}

// ─── BFS (fewest stops) ───────────────────────────────────────────────────────
PathResult Graph::bfs(int src, int dest) const {
    unordered_map<int, bool> visited;
    unordered_map<int, int> prev;
    queue<int> q;

    for (auto& pair : stations) {
    int id = pair.first;
    visited[id] = false;
    prev[id] = -1;
}

    visited[src] = true;
    q.push(src);

    while (!q.empty()) {
        int u = q.front(); q.pop();
        if (u == dest) break;

        auto it = adjList.find(u);
        if (it == adjList.end()) continue;
        for (auto& e : it->second) {
            if (!visited[e.to]) {
                visited[e.to] = true;
                prev[e.to] = u;
                q.push(e.to);
            }
        }
    }

    PathResult result;
    result.found = visited[dest];
    result.totalWeight = 0;

    if (result.found) {
        for (int v = dest; v != -1; v = prev[v])
            result.path.push_back(v);
            reverse(result.path.begin(), result.path.end());
        // compute actual weight along the BFS path
        for (int i = 0; i + 1 < (int)result.path.size(); i++) {
            int u = result.path[i], nxt = result.path[i+1];
            for (auto& e : adjList.at(u))
                if (e.to == nxt) { result.totalWeight += e.weight; break; }
        }
    }
    return result;
}

// ─── DFS reachability ─────────────────────────────────────────────────────────
    vector<int> Graph::dfsReachable(int start) const {
    unordered_set<int> visited;
    stack<int> stk;
    stk.push(start);

    while (!stk.empty()) {
        int u = stk.top(); stk.pop();
        if (visited.count(u)) continue;
        visited.insert(u);
        auto it = adjList.find(u);
        if (it == adjList.end()) continue;
        for (auto& e : it->second)
            if (!visited.count(e.to))
                stk.push(e.to);
    }
    return vector<int>(visited.begin(), visited.end());
}

// ─── Interchange stations ─────────────────────────────────────────────────────
    vector<int> Graph::getInterchanges() const {
    vector<int> result;
    for (auto& pair : stations) {
    int id = pair.first;
    Station s = pair.second;

    if (s.interchange)
        result.push_back(id);
}
    return result;
}

// ─── Connectivity check ───────────────────────────────────────────────────────
bool Graph::isConnected() const {
    if (stations.empty()) return true;
    int start = stations.begin()->first;
    auto reachable = dfsReachable(start);
    return (int)reachable.size() == (int)stations.size();
}

int Graph::countComponents() const {
    unordered_set<int> visited;
    int components = 0;
    for (auto& pair : stations) {
    int id = pair.first;

    if (!visited.count(id)) {
        components++;
        auto reachable = dfsReachable(id);

        for (int r : reachable)
            visited.insert(r);
    }
}
    return components;
}

// ─── Fare (DMRC distance-based slabs) ────────────────────────────────────────
// Weight is in seconds; approx 30km/h average speed → distance in km
int Graph::calculateFare(int totalWeightSeconds) const {
    double distKm = (totalWeightSeconds / 3600.0) * 30.0;
    if (distKm <= 2)   return 10;
    if (distKm <= 5)   return 20;
    if (distKm <= 12)  return 30;
    if (distKm <= 21)  return 40;
    if (distKm <= 32)  return 50;
    return 60;
}