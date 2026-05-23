#pragma once
#include "Graph.h"
#include <string>
using namespace std;

// Loads stations.json into a Graph object.
// Uses a minimal hand-written JSON parser — no third-party libs needed.
Graph loadGraphFromJSON(const string& filePath);