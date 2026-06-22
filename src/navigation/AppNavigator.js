import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const LoginScreen = require('../screens/LoginScreen').default;
const RegisterScreen = require('../screens/RegisterScreen').default;
const HomeScreen = require('../screens/HomeScreen').default;
const AddFoodScreen = require('../screens/AddFoodScreen').default;
const StatsScreen = require('../screens/StatsScreen').default;

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          height: 90,
          paddingBottom: 8,
          paddingTop: 4,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 27 }}>{focused ? '🏠' : '🏡'}</Text>
          )
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Statistik',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 27 }}>{focused ? '📊' : '📈'}</Text>
          )
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddFood"
        component={AddFoodScreen}
        options={{ title: 'Tambah Makanan', headerTintColor: '#4CAF50' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}