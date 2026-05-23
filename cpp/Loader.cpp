#include "Loader.h"
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <regex>
using namespace std;

// ── tiny JSON helpers ──────────────────────────────────────────────────────────
static string getStringField(const string& obj, const string& key) {
    regex re("\"" + key + "\"\\s*:\\s*\"([^\"]+)\"");
    smatch m;
    if (regex_search(obj, m, re)) return m[1].str();
    return "";
}

static int getIntField(const string& obj, const string& key) {
    regex re("\"" + key + "\"\\s*:\\s*(-?[0-9]+)");
    smatch m;
    if (regex_search(obj, m, re)) return std::stoi(m[1].str());
    return 0;
}

static double getDoubleField(const std::string& obj, const string& key) {
    regex re("\"" + key + "\"\\s*:\\s*(-?[0-9]+\\.?[0-9]*)");
    smatch m;
    if (regex_search(obj, m, re)) return std::stod(m[1].str());
    return 0.0;
}

static bool getBoolField(const std::string& obj, const string& key) {
    regex re("\"" + key + "\"\\s*:\\s*(true|false)");
    smatch m;
    if (regex_search(obj, m, re)) return m[1].str() == "true";
    return false;
}

// Extract array items between outermost [ ] of a named array field
static vector<string> extractArrayItems(const string& json, const std::string& arrayKey) {
    string needle = "\"" + arrayKey + "\"";
    size_t pos = json.find(needle);
    if (pos == std::string::npos) return {};

    size_t start = json.find('[', pos);
    if (start == std::string::npos) return {};

    // collect balanced { } objects within the array
    vector<string> items;
    int depth = 0;
    size_t objStart = std::string::npos;

    for (size_t i = start + 1; i < json.size(); i++) {
        char c = json[i];
        if (c == '{') {
            if (depth == 0) objStart = i;
            depth++;
        } else if (c == '}') {
            depth--;
            if (depth == 0 && objStart != std::string::npos) {
                items.push_back(json.substr(objStart, i - objStart + 1));
                objStart = std::string::npos;
            }
        } else if (c == ']' && depth == 0) {
            break;
        }
    }
    return items;
}

Graph loadGraphFromJSON(const string& filePath) {
    ifstream f(filePath);
    if (!f.is_open())
        throw runtime_error("Cannot open: " + filePath);

    ostringstream ss;
    ss << f.rdbuf();
    string json = ss.str();

    Graph g;

    // Load stations
    for (auto& obj : extractArrayItems(json, "stations")) {
        Station s;
        s.id          = getIntField(obj, "id");
        s.name        = getStringField(obj, "name");
        s.line        = getStringField(obj, "line");
        s.interchange = getBoolField(obj, "interchange");
        s.x           = getDoubleField(obj, "x");
        s.y           = getDoubleField(obj, "y");
        g.addStation(s);
    }

    // Load edges
    for (auto& obj : extractArrayItems(json, "edges")) {
        int from   = getIntField(obj, "from");
        int to     = getIntField(obj, "to");
        int weight = getIntField(obj, "weight");
        if (g.hasStation(from) && g.hasStation(to))
            g.addEdge(from, to, weight);
    }

    return g;
}