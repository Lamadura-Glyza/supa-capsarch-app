import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../constants/colors";

export default function PendingApprovalScreen() {
  const { status } = useLocalSearchParams();
  const router = useRouter();

  const isRejected = status === "rejected";

  const message = isRejected
    ? "Your account was not approved. Please contact the administrator for more details."
    : "Your account is currently pending admin approval. Please check back later.";

  const title = isRejected ? "Account Rejected" : "Pending Approval";

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      {/* Title */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: COLORS.white,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      {/* Message */}
      <Text
        style={{
          fontSize: 16,
          color: COLORS.white,
          textAlign: "center",
          marginBottom: 30,
          lineHeight: 22,
          opacity: 0.9,
        }}
      >
        {message}
      </Text>

      {/* Additional info */}
      <Text
        style={{
          color: COLORS.white,
          opacity: 0.7,
          fontSize: 13,
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        {isRejected
          ? "Please reach out to the admin for assistance."
          : "We'll notify you once your account is approved."}
      </Text>

      {/* Log out Button (Same size as Login button) */}
      <TouchableOpacity
        onPress={() => router.replace("/login")}
        style={{
          width: "100%", // same full-width button as in login
          backgroundColor: "transparent",
          borderColor: COLORS.white,
          borderWidth: 2,
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: COLORS.white,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Log out
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
