import React from "react";

import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { styles } from "./courses.styles";

const COURSES = [
  "Physics for Year 09 Core",
  "Physics O Level Cambridge",
  "Physics O Level Edexcel",
  "Physics for Combined Science O Level",
  "Physics AS Cambridge",
];

export default function CoursesPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isPhone = width < 600;
  const isTablet = width >= 600 && width < 1000;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        isTablet &&
          styles.contentTablet,
        isPhone &&
          styles.contentPhone,
      ]}
    >
      <View
        style={[
          styles.navbar,
          isPhone &&
            styles.navbarPhone,
        ]}
      >
        <Pressable
          onPress={() => router.push("/")}
          style={styles.brandContainer}
        >
          <Text
            style={[
              styles.brandName,
              isPhone &&
                styles.brandNamePhone,
            ]}
          >
            MAHMOUD NAGY
          </Text>

          {!isPhone && (
            <>
              <View
                style={styles.brandDivider}
              />

              <Text style={styles.brandSubject}>
                PHYSICS
              </Text>
            </>
          )}
        </Pressable>

        {!isTablet && !isPhone && (
          <View style={styles.navigation}>
            <Pressable
              onPress={() => router.push("/")}
            >
              <Text style={styles.navText}>
                Home
              </Text>
            </Pressable>

            <Text style={styles.navTextActive}>
              Courses
            </Text>

            <Text style={styles.navTextPending}>
              About Me
            </Text>

            <Pressable
              onPress={() =>
                router.push("/contact")
              }
            >
              <Text style={styles.navText}>
                Contact
              </Text>
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={() =>
            router.push("/(auth)/login")
          }
          style={styles.loginButton}
        >
          <Text style={styles.loginText}>
            Login
          </Text>
        </Pressable>
      </View>

      {(isTablet || isPhone) && (
        <View style={styles.compactNav}>
          <Pressable
            onPress={() => router.push("/")}
          >
            <Text style={styles.compactNavText}>
              Home
            </Text>
          </Pressable>

          <Text style={styles.compactNavActive}>
            Courses
          </Text>

          <Pressable
            onPress={() =>
              router.push("/contact")
            }
          >
            <Text style={styles.compactNavText}>
              Contact
            </Text>
          </Pressable>
        </View>
      )}

      <View
        style={[
          styles.hero,
          isPhone &&
            styles.heroPhone,
        ]}
      >
        <Text style={styles.eyebrow}>
          PHYSICS PROGRAMS
        </Text>

        <Text
          style={[
            styles.title,
            isTablet &&
              styles.titleTablet,
            isPhone &&
              styles.titlePhone,
          ]}
        >
          Courses
        </Text>

        <Text
          style={[
            styles.subtitle,
            isPhone &&
              styles.subtitlePhone,
          ]}
        >
          Physics programs for Cambridge,
          Edexcel and international school
          students.
        </Text>
      </View>

      <View
        style={[
          styles.courseGrid,
          isTablet &&
            styles.courseGridTablet,
          isPhone &&
            styles.courseGridPhone,
        ]}
      >
        {COURSES.map((course, index) => (
          <View
            key={course}
            style={[
              styles.courseCard,
              isTablet &&
                styles.courseCardTablet,
              isPhone &&
                styles.courseCardPhone,
            ]}
          >
            <View style={styles.courseHeader}>
              <View style={styles.courseIcon}>
                <Ionicons
                  name="school-outline"
                  size={24}
                  color="#08C8EF"
                />
              </View>

              <Text style={styles.courseNumber}>
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </Text>
            </View>

            <Text
              style={[
                styles.courseTitle,
                isPhone &&
                  styles.courseTitlePhone,
              ]}
            >
              {course}
            </Text>

            <Text
              style={styles.courseDescription}
            >
              Learn physics with structured
              explanation, problem solving and
              exam-focused preparation.
            </Text>

            <View style={styles.courseFooter}>
              <Text style={styles.courseTeacher}>
                Mahmoud Nagy
              </Text>

              <Text style={styles.courseSubject}>
                Physics
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}