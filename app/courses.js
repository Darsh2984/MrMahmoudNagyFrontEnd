import Head from "expo-router/head";
import React from "react";

import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useRouter,
} from "expo-router";

import { styles } from "./courses.styles";

const COURSES = [
  {
    title:
      "Physics for Year 09 Core",

    description:
      "A strong foundation in core physics concepts for Year 09 students.",
  },

  {
    title:
      "Physics O Level Cambridge",

    description:
      "Cambridge O Level Physics preparation with structured concept development and exam practice.",
  },

  {
    title:
      "Physics O Level Edexcel",

    description:
      "Edexcel O Level Physics preparation focused on understanding, application and examination technique.",
  },

  {
    title:
      "Physics for Combined Science O Level",

    description:
      "Physics preparation for students studying O Level Combined Science.",
  },

  {
    title:
      "Physics AS Cambridge",

    description:
      "Cambridge AS Physics covering advanced concepts, problem solving and exam preparation.",
  },
];

export default function CoursesPage() {
  const router = useRouter();

  const { width } =
    useWindowDimensions();

  const compact =
    width < 720;

  function goHome() {
    router.push("/");
  }

  function goContact() {
    router.push("/contact");
  }

  function goLogin() {
    router.push(
      "/(auth)/login"
    );
  }
  <Head>
  <title>
    IGCSE Physics Courses | Mahmoud Nagy Physics
  </title>

  <meta
    name="description"
    content="Explore Physics courses with Mahmoud Nagy: Year 9 Core, Cambridge O Level Physics, Edexcel O Level Physics, Combined Science O Level, and Cambridge AS Physics."
  />

  <meta
    name="keywords"
    content="IGCSE Physics courses, Cambridge O Level Physics, Edexcel O Level Physics, Combined Science Physics, Cambridge AS Physics, Mahmoud Nagy Physics, Laytheg"
  />

  <meta
    name="robots"
    content="index, follow"
  />

  <link
    rel="canonical"
    href="https://laytheg.com/courses"
  />

  <meta
    property="og:title"
    content="IGCSE Physics Courses | Mahmoud Nagy Physics"
  />

  <meta
    property="og:description"
    content="Physics courses for Year 9, Cambridge O Level, Edexcel O Level, Combined Science and Cambridge AS."
  />

  <meta
    property="og:url"
    content="https://laytheg.com/courses"
  />
</Head>
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      <View
        style={[
          styles.navbar,

          compact &&
            styles.navbarCompact,
        ]}
      >
        <Pressable
          onPress={goHome}
          style={
            styles.brandContainer
          }
        >
          <Text
            style={styles.brandName}
          >
            MAHMOUD NAGY
          </Text>

          <View
            style={
              styles.brandDivider
            }
          />

          <Text
            style={
              styles.brandSubject
            }
          >
            PHYSICS
          </Text>
        </Pressable>

        {!compact ? (
          <View
            style={
              styles.navigation
            }
          >
            <Pressable
              onPress={goHome}
            >
              <Text
                style={
                  styles.navText
                }
              >
                Home
              </Text>
            </Pressable>

            <View
              style={
                styles.activeNav
              }
            >
              <Text
                style={
                  styles.navTextActive
                }
              >
                Courses
              </Text>

              <View
                style={
                  styles.activeLine
                }
              />
            </View>

            <Text
              style={
                styles.navTextPending
              }
            >
              About Me
            </Text>

            <Pressable
              onPress={
                goContact
              }
            >
              <Text
                style={
                  styles.navText
                }
              >
                Contact
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          onPress={goLogin}
          style={
            styles.loginButton
          }
        >
          <Text
            style={
              styles.loginText
            }
          >
            Login
          </Text>
        </Pressable>
      </View>

      <View
        style={styles.hero}
      >
        <Text
          style={
            styles.eyebrow
          }
        >
          PHYSICS PROGRAMS
        </Text>

        <Text
          style={[
            styles.title,

            compact &&
              styles.titleCompact,
          ]}
        >
          Courses
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Physics programs designed
          for Cambridge, Edexcel and
          international school
          students.
        </Text>
      </View>

      <View
        style={[
          styles.courseGrid,

          compact &&
            styles.courseGridCompact,
        ]}
      >
        {COURSES.map(
          (course, index) => (
            <View
              key={course.title}
              style={
                styles.courseCard
              }
            >
              <View
                style={
                  styles.courseNumber
                }
              >
                <Text
                  style={
                    styles.courseNumberText
                  }
                >
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </Text>
              </View>

              <View
                style={
                  styles.courseIcon
                }
              >
                <Ionicons
                  name="school-outline"
                  size={27}
                  color="#08C8EF"
                />
              </View>

              <Text
                style={
                  styles.courseTitle
                }
              >
                {course.title}
              </Text>

              <Text
                style={
                  styles.courseDescription
                }
              >
                {
                  course.description
                }
              </Text>

              <View
                style={
                  styles.courseFooter
                }
              >
                <Text
                  style={
                    styles.courseTeacher
                  }
                >
                  Mahmoud Nagy
                </Text>

                <Text
                  style={
                    styles.courseSubject
                  }
                >
                  Physics
                </Text>
              </View>
            </View>
          )
        )}
      </View>
    </ScrollView>
  );
}