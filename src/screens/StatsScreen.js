import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function StatsScreen() {
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const q = query(
      collection(db, 'foodLogs'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const results = days.map(date => {
          const totalKalori = logs
            .filter(item => item.date === date)
            .reduce((sum, item) => sum + (item.calories || 0), 0);

          return {
            date,
            kalori: Math.round(totalKalori)
          };
        });

        setWeekData(results);
        setLoading(false);
      },
      (error) => {
        console.log(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>
          Memuat statistik...
        </Text>
      </View>
    );
  }

  const maxKalori = Math.max(
    ...weekData.map(d => d.kalori),
    1
  );

  const totalMinggu = weekData.reduce(
    (sum, d) => sum + d.kalori,
    0
  );

  const rataRata = Math.round(totalMinggu / 7);

  const hariAktif = weekData.filter(
    d => d.kalori > 0
  ).length;

  const getDayLabel = (dateStr) => {
    const hari = [
      'Min', 'Sen', 'Sel',
      'Rab', 'Kam', 'Jum', 'Sab'
    ];
    return hari[new Date(dateStr).getDay()];
  };

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Statistik Minggu Ini
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryVal}>
            {rataRata}
          </Text>
          <Text style={styles.summaryLabel}>
            Rata-rata kkal/hari
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryVal}>
            {hariAktif}
          </Text>
          <Text style={styles.summaryLabel}>
            Hari aktif
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          Kalori per Hari
        </Text>

        <View style={styles.chartArea}>
          {weekData.map((item, i) => (
            <View key={i} style={styles.barGroup}>
              <Text style={styles.barVal}>
                {item.kalori > 0 ? item.kalori : ''}
              </Text>

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${(item.kalori / maxKalori) * 100}%`,
                      backgroundColor:
                        item.kalori > 1800
                          ? '#CDDC39'
                          : '#4CAF50'
                    }
                  ]}
                />
              </View>

              <Text style={styles.barLabel}>
                {getDayLabel(item.date)}
              </Text>
            </View>
          ))}
        </View>

        {/* Legenda */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Normal</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#CDDC39' }]} />
            <Text style={styles.legendText}>Tinggi (&gt;1800)</Text>
          </View>
        </View>
      </View>

      {/* Detail */}
      <Text style={styles.sectionTitle}>
        Detail Harian
      </Text>

      {weekData.map((item, i) => (
        <View key={i} style={styles.dayRow}>
          <Text style={styles.dayName}>
            {getDayLabel(item.date)},{' '}
            {item.date}
          </Text>

          <Text
            style={[
              styles.dayKalori,
              item.kalori === 0 && styles.dayKaloriEmpty,
              item.kalori > 1800 && styles.dayKaloriHigh
            ]}
          >
            {item.kalori > 0
              ? `${item.kalori} kkal`
              : '-'}
          </Text>
        </View>
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7e6'
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7e6'
  },

  loadingText: {
    marginTop: 10,
    color: '#4CAF50',
    fontSize: 14
  },

  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 24
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },

  summaryRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
    marginTop: 16,
    marginBottom: 16
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C5E1A5'
  },

  summaryVal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#33691E'
  },

  summaryLabel: {
    fontSize: 12,
    color: '#7a9a5a',
    marginTop: 4,
    textAlign: 'center'
  },

  chartCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#C5E1A5'
  },

  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#33691E',
    marginBottom: 16
  },

  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    gap: 6
  },

  barGroup: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end'
  },

  barVal: {
    fontSize: 9,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center'
  },

  barTrack: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end'
  },

  barFill: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4
  },

  barLabel: {
    fontSize: 11,
    color: '#8a9a6a',
    marginTop: 6
  },

  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },

  legendText: {
    fontSize: 11,
    color: '#888'
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#33691E',
    marginHorizontal: 16,
    marginBottom: 10
  },

  dayRow: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DCF0B0'
  },

  dayName: {
    fontSize: 13,
    color: '#555'
  },

  dayKalori: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50'
  },

  dayKaloriEmpty: {
    color: '#ccc'
  },

  dayKaloriHigh: {
    color: '#9E9D24'
  }
});