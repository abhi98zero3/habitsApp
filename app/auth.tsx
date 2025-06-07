import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "expo-router";

export default function AuthScreen() {
  const [isSigned, setIsSigned] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confpassword, setconfPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");
  const {SignIN, SignUP} = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill all the details");
      return;
    }
    if (email && password && password.length < 8) {
      setError("Password must contain 8 characters");
      return;
    }
    setError(null);
    const error = await SignIN(email, password);
    if (error) {
        setError(error);
        return;
    }
    router.replace('/');
};

const handleSignUp = async () => {
    if (!email || !password) {
        setError("Please fill all the details");
        return;
    }
    if (email && password && password.length < 8) {
        setError("Password must contain 8 characters");
        return;
    }
    setError(null);
    const error = await SignUP(email, password, confpassword);
    if (error) {
        setError(error);
        return;
    }
    router.replace('/');
  };

  const switchSigned = () => {
    setIsSigned((prev) => !prev);
  };

  return (
    <View style={style.container}>
      {isSigned ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "padding" : "padding"}
        >
          <View style={style.header}>
            <Text variant="headlineLarge">Welcome Back, Sign In!</Text>
          </View>
          <View style={style.form}>
            <TextInput
              activeOutlineColor="#468ee0"
              style={style.inputField}
              onChangeText={setEmail}
              mode="outlined"
              label={"Email"}
              placeholder="example@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              activeOutlineColor="#468ee0"
              style={style.inputField}
              onChangeText={setPassword}
              mode="outlined"
              label={"Password"}
              placeholder="Password"
              autoCapitalize="none"
              secureTextEntry
            />
            {error && <Text style={{color : theme.colors.error}}>{error}</Text>}
            <Button
              style={style.button}
              mode="contained"
              onPress={handleSignIn}
              >
              SignIn
            </Button>
            <Button
              style={style.txtBtn}
              labelStyle={{ color: "#02611b" }}
              mode="text"
              onPress={switchSigned}
              >
              New User? SignUp.
            </Button>
          </View>
        </KeyboardAvoidingView>
      ) : (
          <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "padding" : "padding"}
          >
          <View style={style.header}>
            <Text variant="headlineLarge">Hey There, Sign Up</Text>
          </View>
          <View style={style.form}>
            <TextInput
              style={style.inputField}
              mode="outlined"
              activeOutlineColor="#468ee0"
              label={"Email"}
              onChangeText={setEmail}
              placeholder="example@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              />
            <TextInput
              style={style.inputField}
              mode="outlined"
              activeOutlineColor="#468ee0"
              label={"Password"}
              onChangeText={setPassword}
              placeholder="Password"
              autoCapitalize="none"
              secureTextEntry
            />
            <TextInput
              style={style.inputField}
              mode="outlined"
              activeOutlineColor="#468ee0"
              label={"Confirm Password"}
              onChangeText={setconfPassword}
              placeholder="Confirm Password"
              autoCapitalize="none"
              secureTextEntry
              />
              {error && <Text style={{color : theme.colors.error}}>{error}</Text>}
            <Button
              style={style.button}
              mode="contained"
              onPress={handleSignUp}
            >
              SignIn
            </Button>
            <Button
              style={style.txtBtn}
              labelStyle={{ color: "#02611b" }}
              mode="text"
              onPress={switchSigned}
            >
              Existing User? SignIn.
            </Button>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b3e8c1",
    justifyContent: "center",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  form: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "10%",
  },
  inputField: {
    marginBottom: 8,
    width: "80%",
    backgroundColor: "#dadee3",
  },
  button: {
    width: "60%",
    backgroundColor: "#02611b",
    marginTop: 20,
  },
  txtBtn: {
    marginTop: 10,
    color: "#02611b",
    width: "60%",
  },
});
