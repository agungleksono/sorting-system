import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
    Button,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Modal,
    TouchableWithoutFeedback,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';
import {AutocompleteDropdownContextProvider} from 'react-native-autocomplete-dropdown';

const MenuScreen = ({navigation}) => {
    const [cases, setCases] = useState([]);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userName, setUserName] = useState('');

    const getCases = useCallback(async () => {
        try {
            setLoading(true);
            const {data} = await api.get('/cases');
            setCases(data.data);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const {data} = await api.get('/cases');
            setCases(data.data);
        } catch (error) {
            console.error('Error refreshing cases:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const getUserName = useCallback(async () => {
        try {
            const name = await AsyncStorage.getItem('name');
            if (name) {
                setUserName(name);
            }
        } catch (error) {
            console.error('Error getting user name:', error);
        }
    }, []);

    useEffect(() => {
        // getCases();
        getUserName();

        // Fetch when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            getCases();
            getUserName();
        });

        // Clean up the listener when the component unmounts
        return unsubscribe;
    }, [navigation, getUserName]);

    const handleCardPress = useCallback((item) => {
        if (item.scan_type_id === '001') {
            navigation.navigate('ScanV2', {caseData: item});
        } else if (item.scan_type_id === '002') {
            navigation.navigate('ScanMultiBox', {caseData: item});
        }
    }, [navigation]);

    const card = useCallback(({item}) => (
        <View style={styles.cardContainer}>
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => handleCardPress(item)}>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressText}>
                                {item.current_progress} / {item.max_progress}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.progressBar}>
                        <View 
                            style={[
                                styles.progressFill, 
                                {width: `${(item.current_progress / item.max_progress) * 100}%`}
                            ]} 
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    ), [handleCardPress]);

    // Add the three dots button in the header using headerRight
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.headerButton}
                    activeOpacity={0.7}>
                    <Text style={styles.headerButtonText}>•••</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleSettingPrint = useCallback(() => {
        navigation.navigate('PrintSetting');
        setMenuVisible(false);
    }, [navigation]);

    const handleNewCase = useCallback(() => {
        navigation.navigate('NewCase');
        setMenuVisible(false);
    }, [navigation]);

    const casesSubtitle = useMemo(() => 
        `${cases.length} case${cases.length !== 1 ? 's' : ''} available`, 
        [cases.length]
    );

    const keyExtractor = useCallback((item) => item.suspect_case_id.toString(), []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            <View style={styles.content}>
                <View style={styles.headerSection}>
                    {userName && (
                        <Text style={styles.welcomeText}>
                            Welcome back, {userName}!
                        </Text>
                    )}
                    <Text style={styles.headerTitle}>Cases</Text>
                    <Text style={styles.headerSubtitle}>
                        {casesSubtitle}
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#14B8A6" />
                        <Text style={styles.loadingText}>Loading cases...</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={cases}
                            renderItem={card}
                            keyExtractor={keyExtractor}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={10}
                            windowSize={10}
                            initialNumToRender={5}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={['#14B8A6']}
                                    tintColor="#14B8A6"
                                    title="Pull to refresh"
                                    titleColor="#6B7280"
                                />
                            }
                        />

                        {cases.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No cases available</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Create a new case to get started
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </View>

            {/* Dropdown Menu Modal */}
            {isMenuVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={isMenuVisible}
                    onRequestClose={() => setMenuVisible(false)}>
                    <TouchableWithoutFeedback
                        onPress={() => setMenuVisible(false)}>
                        <View style={styles.modalBackground}>
                            <View style={styles.menuContainer}>
                                <TouchableOpacity
                                    onPress={handleSettingPrint}
                                    style={styles.menuItem}
                                    activeOpacity={0.7}>
                                    <Text style={styles.menuText}>
                                        Setting Print
                                    </Text>
                                </TouchableOpacity>
                                <View style={styles.menuDivider} />
                                <TouchableOpacity
                                    onPress={handleNewCase}
                                    style={styles.menuItem}
                                    activeOpacity={0.7}>
                                    <Text style={styles.menuText}>
                                        New Case
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    headerSection: {
        paddingTop: 24,
        paddingBottom: 32,
    },
    welcomeText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 3,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '400',
    },
    listContainer: {
        paddingBottom: 24,
    },
    cardContainer: {
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardContent: {
        width: '100%',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
        marginRight: 12,
    },
    progressContainer: {
        backgroundColor: '#14B8A6',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 2,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 16,
        fontWeight: '500',
    },
    headerButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    headerButtonText: {
        fontSize: 20,
        color: '#1F2937',
        fontWeight: '600',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    menuContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        minWidth: 180,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
    },
});

export default MenuScreen;
