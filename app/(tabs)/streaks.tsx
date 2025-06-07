import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import Auth from "@/lib/appwrite";
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
      fetchCompletions();
      fetchHabits();
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
        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
        }
        streak = currentStreak;
        lastDate = date;
      }
    });

    return { streak, bestStreak, total };
  };

  const habitStreaks = habits.map((habit) => {
    const { streak, bestStreak, total } = getSreakData(habit.$id);
    return { habit, bestStreak, streak, total };
  });

  const rankedHabits = habitStreaks.sort((a, b) => a.bestStreak - b.bestStreak);

  return (
    <View style={style.container}>
      <View style={style.header}>
        <Text variant="headlineLarge">Habit Streaks</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator = {false} style={{width : '100%'}}>
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
        ) : (<View style={style.cardContainer}>
          {rankedHabits.map(({habit, streak, bestStreak, total}, key) => (
            <Card key={key} style={style.card}>
                <Card.Content>
                    <Text variant="headlineSmall" style={style.title}>{habit.title}</Text>
                    <Text style={style.description}>{habit.description}</Text>
                    <View style={style.stats}>
                        <View style={style.curr}>
                            <Text style={style.badgeTxt}>🔥{streak}</Text>
                            <Text style={style.badgeLabel}>Current</Text>
                        </View>
                        <View style = {style.best}>
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
    paddingTop: "15%",
    paddingHorizontal: "2%",
    paddingBottom: "5%",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardContainer : {
    width : '100%',
    gap : 20,
    alignItems : 'center'
  },
  card: {
    width : '90%',
  },
  title : {
    fontWeight : 'bold',
    marginBottom : 16
  },
   description : {
    
   },
   stats : {
    flexDirection: "row",
    justifyContent : "space-evenly"
   },
   curr : {

   },
   best : {

   },
   total : {

   },
   badgeTxt : {

   },
   badgeLabel : {

   }
});
