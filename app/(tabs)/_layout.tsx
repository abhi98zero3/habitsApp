import { Tabs } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarPosition : "bottom", tabBarStyle : {backgroundColor : "#f4f7df"}, tabBarActiveTintColor : "#2d8707"}}>
      <Tabs.Screen
        name="index"
        options={{ title: "Today's Habits", tabBarIcon: ({color, size}) => {
            return(<MaterialCommunityIcons name="calendar-today" size={size} color={color}/>)
        } }}
      />
      <Tabs.Screen
        name="streaks"
        options={{ title: "Streaks", tabBarIcon: ({color, size}) => {
            return(<MaterialCommunityIcons name="chart-line" size={size} color={color}/>)
        } }}
      />
      <Tabs.Screen name="addHabit" options={{title : "Add Habit", tabBarIcon : ({color, size}) => {
        return(<MaterialCommunityIcons name="plus" size={size} color={color}/>)
      }}}/>
    </Tabs>
  );
}
