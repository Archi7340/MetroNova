#include <iostream>
#include <string>
#include <sstream>
#include "Graph.h"
#include "Loader.h"
using namespace std;

// ── JSON output helpers ───────────────────────────────────────────────────────
static string stationToJson(const Station& s) {
    ostringstream o;
    o << "{\"id\":" << s.id
      << ",\"name\":\"" << s.name << "\""
      << ",\"line\":\"" << s.line << "\""
      << ",\"interchange\":" << (s.interchange ? "true" : "false")
      << ",\"x\":" << s.x
      << ",\"y\":" << s.y << "}";
    return o.str();
}

static string pathResultToJson(const PathResult& r, const Graph& g, string& algo) {
    ostringstream o;
    o << "{\"found\":" << (r.found ? "true" : "false")
      << ",\"algorithm\":\"" << algo << "\""
      << ",\"totalTime\":" << r.totalWeight
      << ",\"fare\":" << g.calculateFare(r.totalWeight)
      << ",\"stops\":" << (r.path.empty() ? 0 : (int)r.path.size() - 1)
      << ",\"path\":[";

    for (int i = 0; i < (int)r.path.size(); i++) {
        if (i) o << ",";
        auto it = g.stations.find(r.path[i]);
        if (it != g.stations.end())
            o << stationToJson(it->second);
    }
    o << "]}";
    return o.str();
}

static void printError(const string& msg) {
    cout << "{\"error\":\"" << msg << "\"}" << endl;
}

// ── Usage:
//   ./metro_engine route dijkstra <src> <dest>
//   ./metro_engine route bfs      <src> <dest>
//   ./metro_engine stations
//   ./metro_engine interchanges
//   ./metro_engine neighbors <id>
//   ./metro_engine connectivity
// ─────────────────────────────────────────────────────────────────────────────
int main(int argc, char* argv[]) {
    if (argc < 2) {
        printError("No command given");
        return 1;
    }

    string dataPath = "../data/stations.json";
    // Allow override via env var DATA_PATH
    if (const char* env = getenv("DATA_PATH"))
        dataPath = env;

    Graph g;
    try {
        g = loadGraphFromJSON(dataPath);
    } catch (exception& e) {
        printError(string("Load failed: ") + e.what());
        return 1;
    }

    string cmd = argv[1];

    // ── route <algo> <src> <dest> ──────────────────────────────────────────────
    if (cmd == "route") {
        if (argc < 5) { printError("Usage: route <algo> <src> <dest>"); return 1; }
        string algo = argv[2];
        int src  = stoi(argv[3]);
        int dest = stoi(argv[4]);

        if (!g.hasStation(src))  { printError("Unknown source station"); return 1; }
        if (!g.hasStation(dest)) { printError("Unknown destination station"); return 1; }

        PathResult result;
        if (algo == "dijkstra")      result = g.dijkstra(src, dest);
        else if (algo == "bfs")      result = g.bfs(src, dest);
        else { printError("Unknown algorithm: " + algo); return 1; }

        cout << pathResultToJson(result, g, algo) << endl;

    // ── stations ───────────────────────────────────────────────────────────────
    } else if (cmd == "stations") {
        cout << "[";
        bool first = true;
        for (auto& pair : g.stations) {
    Station s = pair.second;

    if (!first)
        cout << ",";

    cout << stationToJson(s);
    first = false;
}
        cout << "]" << endl;

    // ── interchanges ───────────────────────────────────────────────────────────
    } else if (cmd == "interchanges") {
        auto ic = g.getInterchanges();
        cout << "[";
        for (int i = 0; i < (int)ic.size(); i++) {
            if (i) cout << ",";
            cout << stationToJson(g.stations.at(ic[i]));
        }
        cout << "]" << endl;

    // ── neighbors <id> ─────────────────────────────────────────────────────────
    } else if (cmd == "neighbors") {
        if (argc < 3) { printError("Usage: neighbors <id>"); return 1; }
        int id = stoi(argv[2]);
        if (!g.hasStation(id)) { printError("Unknown station"); return 1; }
        auto nb = g.getNeighbors(id);
        cout << "[";
        for (int i = 0; i < (int)nb.size(); i++) {
            if (i) cout << ",";
            cout << stationToJson(g.stations.at(nb[i]));
        }
        cout << "]" << endl;

    // ── connectivity ───────────────────────────────────────────────────────────
    } else if (cmd == "connectivity") {
        bool conn = g.isConnected();
        int comp  = g.countComponents();
        // DFS reachable from first station
        int start = g.stations.begin()->first;
        auto reach = g.dfsReachable(start);
        cout << "{\"connected\":" << (conn ? "true" : "false")
                  << ",\"components\":" << comp
                  << ",\"totalStations\":" << g.stations.size()
                  << ",\"reachableFromStart\":" << reach.size()
                  << "}" << endl;

    } else {
        printError("Unknown command: " + cmd);
        return 1;
    }

    return 0;
}