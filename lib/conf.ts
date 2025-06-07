const conf = {
    appwriteEndpoint : String(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!),
    appwriteProjectID : String(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID),
    appwriteDatabaseID : String(process.env.EXPO_PUBLIC_APPWRITE_DB_ID),
    appwritePlatform : String(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM),
    appwriteHabitsCollectionID : String(process.env.EXPO_PUBLIC_APPWRITE_HABITS_COLLECTION_ID),
    appwriteHabitCompletionID : String(process.env.EXPO_PUBLIC_APPWRITE_HABITS_COMPLETION_COLLECTION_ID)
}
export default conf;