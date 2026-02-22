import { Tabs } from 'expo-router';
import { Home, Calculator, TrendingUp, FileSearch, ScanSearch } from 'lucide-react-native';
import { useLanguageStore } from '@/lib/store';

export default function TabsLayout() {
  const language = useLanguageStore((s) => s.language);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#022c22',
          borderTopColor: '#064e3b',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarActiveTintColor: '#34d399',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: language === 'ar' ? 'الرئيسية' : 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="zakat"
        options={{
          title: language === 'ar' ? 'الزكاة' : 'Zakat',
          tabBarIcon: ({ color, size }) => <Calculator size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="investments"
        options={{
          title: language === 'ar' ? 'استثمارات' : 'Invest',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contracts"
        options={{
          title: language === 'ar' ? 'العقود' : 'Contracts',
          tabBarIcon: ({ color, size }) => <FileSearch size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="screener"
        options={{
          title: language === 'ar' ? 'الفاحص' : 'Screen',
          tabBarIcon: ({ color, size }) => <ScanSearch size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
