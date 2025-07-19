import { Text, View, StyleSheet, Image } from 'react-native';
import { rs } from 'responsive-csx';

export default function App() {
  return <ProfileScreen />;
}

function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
        style={styles.avatar}
      />

      <Text style={styles.name}>John Doe</Text>
      <Text style={styles.bio}>UX Designer · Coffee Lover</Text>

      <View style={styles.statsContainer}>
        <Stat label="Followers" value="12.3k" />
        <Stat label="Following" value="840" />
        <Stat label="Projects" value="27" />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: rs.s(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  avatar: {
    width: rs.cl(100, rs.s(100), Infinity),
    height: rs.cl(100, rs.s(100), Infinity),
    borderRadius: rs.s(50, { min: 50 }),
    marginBottom: rs.cl(16, rs.vs(16), Infinity),
  },
  name: {
    fontSize: rs.fs(22),
    fontWeight: '600',
    marginBottom: rs.cl(4, rs.vs(4), Infinity),
  },
  bio: {
    fontSize: rs.fs(14, { min: 14 }),
    color: '#666',
    marginBottom: rs.vs(20),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: rs.vs(12),
    backgroundColor: '#fff',
    borderRadius: rs.s(12),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: rs.s(8),
    elevation: 3,
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: rs.s(12),
  },
  statValue: {
    fontSize: rs.fs(18),
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: rs.fs(12),
    color: '#888',
  },
});
