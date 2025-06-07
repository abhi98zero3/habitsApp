import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Button } from "react-native-paper";
import { useAuth } from "@/lib/authContext";
import Auth, { RealtimeResponse } from "@/lib/appwrite";
import conf from "@/lib/conf";
import { Query, ID } from "react-native-appwrite";
import { useEffect, useState, useRef } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Swipeable } from "react-native-gesture-handler";
import { Habit, HabitCompletion } from "@/types/database.types";
import { router } from "expo-router";

export default function Index() {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>();
  const [completedHabits, setCompletedHabits] = useState<string[]>();
  const swipableRef = useRef<{ [key: string]: Swipeable | null }>({});
  const isHabitCompleted = (habitID: string) => completedHabits?.includes(habitID);
  

  const fetchHabits = async () => {
    try {
      const response = await Auth.databases.listDocuments(
        conf.appwriteDatabaseID,
        conf.appwriteHabitsCollectionID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.log(error);
    }
  };

  const removeHabit = (documentID: string) => {
    Auth.databases.deleteDocument(
      conf.appwriteDatabaseID,
      conf.appwriteHabitsCollectionID,
      documentID
    );
  };

  const updateStreak = async (documentID: string) => {
    const currentDate = new Date().toISOString();
    if (!user || completedHabits?.includes(documentID)) return;
    try {
      await Auth.databases.createDocument(
        conf.appwriteDatabaseID,
        conf.appwriteHabitCompletionID,
        ID.unique(),
        {
          habit_id: documentID,
          user_id: user.$id,
          completed_at: currentDate,
        }
      );
      const habit = habits?.find((h) => h?.$id === documentID);
      if (!habit) return;
      await Auth.databases.updateDocument(
        conf.appwriteDatabaseID,
        conf.appwriteHabitsCollectionID,
        documentID,
        {
          streak_count: habit.streak_count + 1,
          last_completed: currentDate,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCompletedHabits = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await Auth.databases.listDocuments(
        conf.appwriteDatabaseID,
        conf.appwriteHabitCompletionID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ]
      );
      const completions = response.documents as HabitCompletion[];
      setCompletedHabits(completions.map((completion) => completion.habit_id));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      const channel = `databases.${conf.appwriteDatabaseID}.collections.${conf.appwriteHabitsCollectionID}.documents`;
      const habitSubs = Auth.client.subscribe(
        channel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            fetchHabits();
          }
        }
      );

      const completionchannel = `databases.${conf.appwriteDatabaseID}.collections.${conf.appwriteHabitCompletionID}.documents`;
      const completionSubs = Auth.client.subscribe(
        completionchannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchCompletedHabits();
          }
        }
      );

      fetchCompletedHabits();
      fetchHabits();

      return () => {
        habitSubs();
        completionSubs();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user]);

  const renderLeftActions = () => (
    <View style={style.leftAction}>
      <MaterialCommunityIcons
        name="trash-can-outline"
        size={32}
        color={"#fff"}
      />
    </View>
  );
  const renderRightActions = () => (
    <View style={style.rightAction}>
      <MaterialCommunityIcons name="fire" size={32} color={"#fff"} />
    </View>
  );

  return (
    <View style={style.container}>
      <View style={style.header}>
        <Text variant="headlineLarge">Today&apos;s Habits</Text>
        <Button
          onPress={signOut}
          icon={"logout"}
          mode="text"
          labelStyle={{ color: "#02611b" }}
        >
          Sign Out
        </Button>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width: "100%" }}
      >
        {habits?.length === 0 ? (
          <View>
            <Text>No habits added yet! Add your first Habit.</Text>
            <Button onPress={() => router.navigate('/(tabs)/addHabit')} mode="contained" style={{backgroundColor : '#02611b'}}><MaterialCommunityIcons name="plus-circle" size={18} color={'#fff'}/>Add Habit</Button>
          </View>
        ) : (
          <View style={style.cardContainer}>
            {habits?.map((habit, key) => (
              <Swipeable
                key={key}
                ref={(ref) => {
                  swipableRef.current[habit.$id] = ref;
                }}
                overshootLeft={false}
                overshootRight={false}
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}
                onSwipeableOpen={(direction) => {
                  if (direction === "left") {
                    removeHabit(habit.$id);
                  } else if (direction === "right") {
                    updateStreak(habit.$id);
                  }
                  swipableRef.current[habit.$id]?.close();
                }}
              >
                <View
                  style={[
                    style.card,
                    isHabitCompleted(habit.$id) && style.cardCompleted,
                  ]}
                >
                  <View style={style.title}>
                    <Text
                      variant="headlineSmall"
                      style={{ fontWeight: "bold" }}
                    >
                      {habit.title}
                    </Text>
                    <View
                      style={{ flexDirection: "row", gap: 5, marginBottom: 15 }}
                    >
                      {/* <Button
                        onPress={habit.streak_count + 1}
                        mode="contained"
                        style={{ backgroundColor: "#ff9800" }}
                      >
                        <MaterialCommunityIcons
                          name="fire"
                          size={24}
                          color={"#ffffff"}
                        />
                      </Button>
                      <Button
                        onPress={() => removeHabit(habit.$id)}
                        mode="contained"
                        style={{ backgroundColor: "#e62c32", borderRadius: 30 }}
                      >
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={24}
                          color={"#ffffff"}
                        />{" "}
                      </Button> */}
                    </View>
                  </View>
                  <View style={style.bodyTxt}>
                    <MaterialCommunityIcons
                      name="book-edit"
                      size={18}
                      color="#5c5c5b"
                    />
                    <Text style={style.bodyTxt} variant="bodyMedium">
                      {habit.description}
                    </Text>
                  </View>
                  <View style={style.footer}>
                    <View style={style.streakSection}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color={"#ff9800"}
                      />
                      <Text style={style.streakSection}>
                        {habit.streak_count} Day Streak
                      </Text>
                    </View>
                    <View style={style.freq}>
                      <FontAwesome6
                        name="chart-simple"
                        size={18}
                        color="#0f5491"
                      />
                      <Text
                        style={{
                          color: "#0f5491",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                      >
                        {habit.frequency.at(0)?.toUpperCase() +
                          habit.frequency.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Swipeable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#faeceb",
  },
  header: {
    marginTop: "13%",
    padding: "3%",
    marginHorizontal: "8%",
    borderRadius: 30,
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  card: {
    flexDirection: "column",
    marginTop: 15,
    borderWidth: 2,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 18,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: "#e9f5cb",
  },
  cardContainer: {
    gap: 5,
    paddingHorizontal: "5%",
    width: "100%",
  },
  bodyTxt: {
    flex: 1,
    flexDirection: "row",
    color: "#5c5c5b",
    gap: 5,
  },
  streakSection: {
    flexDirection: "row",
    color: "#ff9800",
    fontWeight: "bold",
    backgroundColor: "#faf1b9",
    paddingHorizontal: 6,
    borderRadius: 30,
  },
  freq: {
    flexDirection: "row",
    fontWeight: "bold",
    backgroundColor: "#cbf5f5",
    paddingHorizontal: 10,
    borderRadius: 30,
    gap: 5,
  },
  footer: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftAction: {
    backgroundColor: "#e62c32",
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    borderRadius: 18,
    marginTop: 18,
    marginBottom: 3,
    paddingLeft: 20,
    width: "85%",
  },
  rightAction: {
    backgroundColor: "#ff9800",
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    borderRadius: 18,
    marginTop: 18,
    marginBottom: 3,
    paddingLeft: 20,
    width: "85%",
  },
  cardCompleted: {
    opacity : 0.6,
  },
});
