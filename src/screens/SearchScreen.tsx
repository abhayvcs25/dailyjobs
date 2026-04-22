import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// Sample worker data (in real app, this would come from API)
const SAMPLE_WORKERS = [
  {
    id: 1,
    name: "Lakshmi Bai",
    skill: "House Cleaning",
    rating: 4.8,
    price: "$15/hour",
    image: "🧹"
  },
  {
    id: 2,
    name: "Manjunath H",
    skill: "Electrical Work",
    rating: 4.9,
    price: "$20/hour",
    image: "⚡"
  },
  {
    id: 3,
    name: "Priya Singh",
    skill: "Plumbing",
    rating: 4.7,
    price: "$18/hour",
    image: "🔧"
  },
  {
    id: 4,
    name: "Ravi Kumar",
    skill: "House Cleaning",
    rating: 4.6,
    price: "$12/hour",
    image: "🧹"
  },
];

export default function SearchScreen() {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // 🔥 Responsive scale
  const scale = (size: number) => (width / 390) * size;
  const vScale = (size: number) => (height / 844) * size;
  const mod = (size: number) => size + (scale(size) - size) * 0.5;

  const [searchQuery, setSearchQuery] = useState(route.params?.query || '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Extract initial query from route params
  useEffect(() => {
    if (route.params?.query) {
      handleSearch(route.params.query);
    }
  }, [route.params?.query]);

  const handleSearch = (query: string) => {
    setLoading(true);
    setSearched(true);

    // Simulate API call delay
    setTimeout(() => {
      if (query.trim() === '') {
        setResults([]);
      } else {
        // Filter workers based on query
        const filtered = SAMPLE_WORKERS.filter(worker =>
          worker.name.toLowerCase().includes(query.toLowerCase()) ||
          worker.skill.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      }
      setLoading(false);
    }, 500);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderWorkerCard = ({ item }: any) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#fff',
        borderRadius: scale(12),
        padding: scale(12),
        marginBottom: vScale(12),
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
      }}
      onPress={() => Alert.alert('Worker', `${item.name} - ${item.skill}`)}
    >
      <View
        style={{
          width: scale(50),
          height: scale(50),
          borderRadius: scale(25),
          backgroundColor: '#E0E7FF',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: scale(12),
        }}
      >
        <Text style={{ fontSize: scale(24) }}>{item.image}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: mod(14), fontWeight: '700', color: '#111827' }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: mod(12), color: '#9CA3AF', marginTop: vScale(2) }}>
          {item.skill}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: vScale(4) }}>
          <Text style={{ fontSize: mod(11), color: '#F59E0B' }}>⭐ {item.rating}</Text>
          <Text style={{ fontSize: mod(11), color: '#2563EB', marginLeft: scale(8) }}>
            {item.price}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: '#2563EB',
          paddingHorizontal: scale(12),
          paddingVertical: vScale(6),
          borderRadius: scale(6),
        }}
      >
        <Text style={{ color: '#fff', fontSize: mod(12), fontWeight: '600' }}>
          Hire
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#EFF3FB' }}>
      {/* HEADER */}
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: scale(12),
          paddingVertical: vScale(12),
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          marginTop: vScale(10),
          marginBottom: vScale(10),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: scale(8) }}>
            <Text style={{ fontSize: scale(20) }}>←</Text>
          </TouchableOpacity>

          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: scale(8), paddingHorizontal: scale(10) }}>
            <Text style={{ fontSize: scale(16), marginRight: scale(4) }}>🔍</Text>
            <TextInput
              style={{ flex: 1, paddingVertical: scale(10), fontSize: mod(14), color: '#111827' }}
              placeholder="Search workers..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setResults([]);
                setSearched(false);
              }}>
                <Text style={{ fontSize: scale(16) }}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(12),
          paddingVertical: vScale(12),
          paddingBottom: vScale(60),
        }}
      >
        {loading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: vScale(40) }}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={{ marginTop: vScale(12), color: '#666' }}>Searching...</Text>
          </View>
        ) : searched ? (
          results.length > 0 ? (
            <>
              <Text style={{ fontSize: mod(14), fontWeight: '700', marginBottom: vScale(12), color: '#111827' }}>
                Found {results.length} worker{results.length !== 1 ? 's' : ''}
              </Text>
              {results.map(worker => (
                <View key={worker.id}>
                  {renderWorkerCard({ item: worker })}
                </View>
              ))}
            </>
          ) : (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: vScale(40) }}>
              <Text style={{ fontSize: scale(18) }}>🔍</Text>
              <Text style={{ fontSize: mod(16), fontWeight: '600', color: '#111827', marginTop: vScale(12) }}>
                No workers found
              </Text>
              <Text style={{ fontSize: mod(12), color: '#9CA3AF', marginTop: vScale(4), textAlign: 'center' }}>
                Try searching for a different skill or worker name
              </Text>
            </View>
          )
        ) : (
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: vScale(60) }}>
            <Text style={{ fontSize: scale(32) }}>🔍</Text>
            <Text style={{ fontSize: mod(16), fontWeight: '600', color: '#111827', marginTop: vScale(12) }}>
              Search for workers
            </Text>
            <Text style={{ fontSize: mod(12), color: '#9CA3AF', marginTop: vScale(4), textAlign: 'center' }}>
              Enter a skill or worker name to find available professionals
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}