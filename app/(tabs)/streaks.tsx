import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import Auth, { RealtimeResponse } from "@/lib/appwrite";
import conf from "@/lib/conf";
import { Query } from "react-native-appwrite";
import { Habit, HabitCompletion } from "@/types/database.types";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function Streaks() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);

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

  const fetchCompletions = async () => {
    try {
      const response = await Auth.databases.listDocuments(
        conf.appwriteDatabaseID,
        conf.appwriteHabitCompletionID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      const completions = response.documents as HabitCompletion[];
      setCompletedHabits(completions);
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
            fetchCompletions();
          }
        }
      );
      fetchCompletions();
      fetchHabits();
      return () => {
        habitSubs();
        completionSubs();
      };
    }
  });

  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }

  const getSreakData = (habitID: string): StreakData => {
    const habitCompletions = completedHabits
      ?.filter((c) => c.habit_id === habitID)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime()
      );
    if (habitCompletions?.length === 0) {
      return { streak: 0, bestStreak: 0, total: 0 };
    }

    let streak = 0;
    let bestStreak = 0;
    let total = habitCompletions?.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    habitCompletions.forEach((comp) => {
      const date = new Date(comp.completed_at);
      if (lastDate) {
        const diff =
          (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diff <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
      streak = currentStreak;
      lastDate = date;
    });

    return { streak, bestStreak, total };
  };
  const badgeStyles = [style.badge1, style.badge2, style.badge3];

  const habitStreaks = habits.map((habit) => {
    const { streak, bestStreak, total } = getSreakData(habit.$id);
    return { habit, bestStreak, streak, total };
  });

  const rankedHabits = habitStreaks.sort((a, b) => b.bestStreak - a.bestStreak);

  return (
    <View style={style.container}>
      <View style={style.header}>
        <Text variant="headlineLarge">Habit Streaks</Text>
      </View>
      {rankedHabits.length > 0 && (
        <View style={style.rankingContainer}>
          <Text style={style.rankingTitle}>🏅 Top Streaks </Text>
          {rankedHabits.slice(0, 3).map((item, key) => (
            <View key={key} style={style.rankingRow}>
              <View style={[style.rankingBadge, badgeStyles[key]]}>
                <Text style={style.rankingBadgeTxt}>{key + 1}</Text>
                </View>
                <Text style={style.rankingHabit}>{item.habit.title}</Text>
                <Text style={style.rankingStreak}>{item.bestStreak}</Text>
            </View>
          ))}
        </View>
      )}
      {habits.length === 0 ? (
        <View>
          <Text>No habits added yet! Add your first Habit.</Text>
          <Button
            onPress={() => router.navigate("/(tabs)/addHabit")}
            mode="contained"
            style={{ backgroundColor: "#02611b" }}
          >
            <MaterialCommunityIcons
              name="plus-circle"
              size={18}
              color={"#fff"}
            />
            Add Habit
          </Button>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={style.cardContainer}
          contentContainerStyle={{ alignItems: "center" }}
        >
          {rankedHabits.map(({ habit, streak, bestStreak, total }, key) => (
            <Card key={key} style={[style.card, key === 0 && style.firstCard]}>
              <Card.Content>
                <Text variant="headlineSmall" style={style.title}>
                  {habit.title}
                </Text>
                <Text style={style.description}>{habit.description}</Text>
                <View style={style.stats}>
                  <View style={style.curr}>
                    <Text style={style.badgeTxt}>🔥{streak}</Text>
                    <Text style={style.badgeLabel}>Current</Text>
                  </View>
                  <View style={style.best}>
                    <Text style={style.badgeTxt}>🏆🔥{bestStreak}</Text>
                    <Text style={style.badgeLabel}>Best</Text>
                  </View>
                  <View style={style.total}>
                    <Text style={style.badgeTxt}>✅{total}</Text>
                    <Text style={style.badgeLabel}>Total</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
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
    paddingTop: "15%",
    paddingHorizontal: "2%",
    paddingBottom: "5%",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardContainer: {
    width: "100%",
    gap: 20,
  },
  card: {
    width: "90%",
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    color: "#6c6c80",
    marginBottom: 8,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  curr: {
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  best: {
    backgroundColor: "#fffde7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  total: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  badgeTxt: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#22223b",
  },
  badgeLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    fontWeight: 500,
  },
  firstCard: {
    borderWidth: 2,
    borderColor: "#0f5491",
  },
  badge1: {
    backgroundColor: "#ffd700",
  },
  badge2: {
    backgroundColor: "#c0c0c0",
  },
  badge3: {
    backgroundColor: "#cd7f32",
  },
  rankingContainer: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width : '90%'
  },
  rankingTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#0f5491",
    letterSpacing: 0.5,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
    justifyContent : 'space-between'
  },
  rankingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    paddingTop : 2,
    paddingLeft : 10,
    marginRight: 20,
    backgroundColor: "#e0e0e0",
    flexDirection : "row"
  },
  rankingBadgeTxt: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
  },
  rankingHabit: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: '600',
  },
  rankingStreak: {
    fontSize: 14,
    color: "#0f5491",
    fontWeight: "bold",
  },
});
