#include <iostream>
#include <fstream>
#include <queue>
#include <string>
#include <vector>
#include <ctime>
#include "nlohmann/json.hpp"

using namespace std;
using json = nlohmann::json;

struct Task
{
    int id;
    string title;
    string description;
    string priority;
    string category;
    string dueDate;
    bool completed;
    string createdAt;
};

queue<Task> taskQueue;
vector<Task> allTasks;
int nextId = 1;

void addTask(Task task)
{
    taskQueue.push(task);
    allTasks.push_back(task);
}

void saveToFile()
{
    json j;
    for (auto &task : allTasks)
    {
        j.push_back({{"id", task.id},
                     {"title", task.title},
                     {"description", task.description},
                     {"priority", task.priority},
                     {"category", task.category},
                     {"dueDate", task.dueDate},
                     {"completed", task.completed},
                     {"createdAt", task.createdAt}});
    }
    ofstream file("tasks.json");
    file << j.dump(4);
    file.close();
}

int main(int argc, char *argv[])
{
    // Load existing tasks from file
    ifstream infile("tasks.json");
    if (infile.good())
    {
        json j;
        infile >> j;
        for (auto &item : j)
        {
            Task t;
            t.id = item["id"];
            t.title = item["title"];
            t.description = item["description"];
            t.priority = item["priority"];
            t.category = item["category"];
            t.dueDate = item["dueDate"];
            t.completed = item["completed"];
            t.createdAt = item["createdAt"];
            allTasks.push_back(t);
            if (t.id >= nextId)
                nextId = t.id + 1;
        }
    }
    infile.close();

    if (argc < 6)
    {
        cout << "Usage: ./task_backend <title> <description> <priority> <category> <dueDate>" << endl;
        return 1;
    }

    Task newTask;
    newTask.id = nextId++;
    newTask.title = argv[1];
    newTask.description = argv[2];
    newTask.priority = argv[3];
    newTask.category = argv[4];
    newTask.dueDate = argv[5];
    newTask.completed = false;

    time_t now = time(0);
    newTask.createdAt = ctime(&now);

    addTask(newTask);
    saveToFile();

    cout << "Task added successfully." << endl;
    return 0;
}