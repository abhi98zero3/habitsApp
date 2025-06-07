import Auth from "@/lib/appwrite";
import { useAuth } from "@/lib/authContext";
import conf from "@/lib/conf";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { ID } from "react-native-appwrite";
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  useTheme,
} from "react-native-paper";

export default function AddHabit() {
  const frequencies = ["daily", "weekly", "monthly"];
  type Frequency = (typeof frequencies)[number];
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>("");
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!user) return;
    try {
      if (!title && !description) {
        setError("Please input title.");
        return;
      }
      await Auth.databases.createDocument(
        conf.appwriteDatabaseID,
        conf.appwriteHabitsCollectionID,
        ID.unique(),
        {
          user_id: user.$id,
          title: title,
          description: description,
          frequency: frequency,
          streak_count: 0,
          last_completed: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }
      );
      setError(null);
      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      setError("There is an error creating the habit");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "android" ? "padding" : "padding"}
    >
      <View style={style.container}>
        <View style={style.header}>
          <Text variant="headlineMedium">Add Habits</Text>
        </View>
        <View style={style.form}>
          <TextInput
            activeOutlineColor="#468ee0"
            onChangeText={setTitle}
            style={style.txtfield}
            mode="outlined"
            autoCapitalize="words"
            label={"Title"}
            placeholder="Title"
          />
          <TextInput
            activeOutlineColor="#468ee0"
            onChangeText={setDescription}
            style={style.txtfield}
            mode="outlined"
            autoCapitalize="sentences"
            label={"Description"}
            placeholder="Description"
          />
          <SegmentedButtons
            style={style.segBtn}
            value={frequency}
            onValueChange={(value) => setFrequency(value as Frequency)}
            buttons={frequencies.map((frequency) => ({
              value: frequency,
              label:
                frequency.charAt(0).toLocaleUpperCase() + frequency.slice(1),
              checkedColor: "#02611b",
              uncheckedColor: "#6b5e54",
              style: { backgroundColor: "#f0f2c9" },
            }))}
          />
          {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
          <Button onPress={handleSubmit} mode="contained" style={style.btn} disabled={!title || !description}>
            Add Habit
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#faeceb",
  },
  header: {
    paddingTop: "15%",
    paddingHorizontal: "3%",
    paddingBottom: "5%",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  form: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
  },
  txtfield: {
    width: "80%",
    backgroundColor: "#dadee3",
    marginBottom: 8,
  },
  segBtn: {
    width: "80%",
  },
  btn: {
    width: "80%",
    marginTop: 25,
    backgroundColor: "#02611b",
  },
});
