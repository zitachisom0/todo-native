import { Baloo2_700Bold, useFonts } from '@expo-google-fonts/baloo-2';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface Task {
  text: string;
  done: boolean;
  id: number;
  priority?: "low" | "medium" | "high";
}
export default function HomeScreen() {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const remainingTasks = tasks.filter((task) => !task.done).length;
  const [searchQuery, setSearchQuery] = useState("");
  const addTask = () => {
    setTasks([...tasks, {id:Date.now(), text, done:false}]);
    setText("");
  }
  const [fontsLoaded] = useFonts({
    Baloo2_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const deleteTask = (idToDelete: number) => {
    setTasks(tasks.filter((task) => task.id !== idToDelete));
  };

  const toggleDone = (idToToggle: number) => {
    setTasks(tasks.map((task) =>
      task.id === idToToggle ? { ...task, done: !task.done } : task
    ));
  };

  const startEditing = (idToEdit: number) => {
    setEditingIndex(idToEdit);
    setEditingText(tasks.find((task) => task.id === idToEdit)?.text || "");
  };

  const saveEditing = (idToSave: number) => {
    setTasks(tasks.map((task) =>
      task.id === idToSave ? { ...task, text: editingText } : task
    ));
    setEditingIndex(null);
    setEditingText("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  useEffect(() => {
    const loadTasks = async () => {
      const saved = await AsyncStorage.getItem("tasks");
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
    filter === "pending" ? !task.done :
    filter === "completed" ? task.done:
    true; // for "all"
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <View style={styles.tape} />
        <Text style={styles.title}>My To-Do List</Text>
      </View>
      <Text style={{color: '#f0e1e1', fontWeight: 'bold'}}>
        Remaining tasks: {remainingTasks}
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        style={styles.input}
        onSubmitEditing={addTask}/>

        <TextInput style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tasks..."
        />

        {/* buttons */}
      <Pressable  onPress={addTask}>
      <View style={styles.button}>
        <Text style={styles.ButtonText}>Add Text</Text>
      </View>
      </Pressable>
      <Pressable onPress={() => {setFilter("all")}}>
        <Text style={styles.filterButtonText}>All</Text>
      </Pressable>
      <Pressable onPress={() => {setFilter("pending")}}>
        <Text style={styles.filterButtonText}>Pending</Text>
      </Pressable>
      <Pressable onPress={() => {setFilter("completed")}}>
        <Text style={styles.filterButtonText}>Completed</Text>
      </Pressable>
      {filteredTasks.length === 0 && (
        <Text style={{color: '#f0e1e1', fontWeight: 'bold', marginTop: 20}}>
          No matching tasks found.
        </Text>
      )}
      {
      filteredTasks.map((task, index) => (
        <View
          key={task.id}
          style={[
            styles.taskRow,
            {
              backgroundColor: index % 2 === 0 ? '#FFD166' : '#8ECDB7',
              transform: [{ rotate: index % 2 === 0 ? '-1deg' : '1deg' }],
            },
          ]}
        >

          <Pressable onPress={() => toggleDone(task.id)}>
            <View style={[styles.checkbox, task.done && styles.checked]}/>
          </Pressable>

          {
            editingIndex === task.id ? (
              <>
                <TextInput value = {editingText} onChangeText={setEditingText} style={styles.input}/>
                <Pressable onPress={() => saveEditing(task.id)}>
                  <Text style={styles.saveText}>Save</Text>
                </Pressable>
                <Pressable onPress={() => cancelEditing()}>
                  <Text style={styles.deleteText}>
                    Cancel
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.task, task.done && styles.doneText]}>{task.text}</Text>
                <Pressable onPress={() => startEditing(task.id)}>
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
              </>
            )
          }


          <Pressable onPress={() => deleteTask(task.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    backgroundColor: '#1B2A4A',
  },
  titleWrap: {
    marginBottom: 20,
    alignItems: 'center',
  },
  tape: {
    position: 'absolute',
    top: -10,
    width: 90,
    height: 22,
    backgroundColor: 'rgba(255, 111, 89, 0.45)',
    transform: [{ rotate: '-3deg' }],
  },
  title: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 26,
    color: '#FFD166',
  },
  input: {
    borderWidth: 2,
    borderColor: '#1B2A4A',
    borderRadius: 6,
    padding: 10,
    width: 220,
    marginTop: 20,
    backgroundColor: 'white',
    fontFamily: 'Inter_400Regular',
  },
  task: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#1B2A4A',
    flex: 1,
  },
  doneText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  button: {
    backgroundColor: '#FF6F59',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: 6,
  },
  ButtonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  filterButtonText: {
    color: '#FFD166',
    fontFamily: 'Inter_600SemiBold',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#FFD166',
    borderRadius: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#1B2A4A',
    borderRadius: 11,
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#1B2A4A',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 14,
    borderRadius: 4,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 2, height: 4 },
    elevation: 4,
  },
  deleteText: {
    color: '#1B2A4A',
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  editText: {
    color: '#1B2A4A',
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  saveText: {
    color: '#1B2A4A',
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
});
