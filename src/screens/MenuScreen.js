import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import api from '../api/axiosInstance';
import {AutocompleteDropdownContextProvider} from 'react-native-autocomplete-dropdown';

const MenuScreen = ({navigation}) => {
    const [cases, setCases] = useState([]);
    const [isMenuVisible, setMenuVisible] = useState(false);

    const getCases = async () => {
        try {
            const {data} = await api.get('/cases');
            setCases(data.data);
        } catch (error) {
            console.error('Error fetching cases:', error);
        }
    };

    useEffect(() => {
        // getCases();

        // Fetch when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            getCases();
        });

        // Clean up the listener when the component unmounts
        return unsubscribe;
    }, [navigation]);

    const card = ({item}) => (
        <View style={styles.cardContainer}>
            <TouchableOpacity
                style={styles.card}
                // onPress={() => navigation.navigate('ScanV2', {caseData: item})}
                onPress={() => {
                    if (item.scan_type_id === '001') {
                        navigation.navigate('ScanV2', {caseData: item});
                    } else if (item.scan_type_id === '002') {
                        navigation.navigate('ScanMultiBox', {caseData: item});
                    }
                }}>
                <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.progressContainer}>
                        <Text
                            style={[styles.progressText, styles.progressBadge]}>
                            {item.current_progress} / {item.max_progress}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );

    // Add the three dots button in the header using headerRight
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>...</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleSettingPrint = () => {
        navigation.navigate('PrintSetting');
        setMenuVisible(false);
    };

    return (
        //         {/* Render the cases in a FlatList for efficient rendering */}
        // <FlatList
        //     data={cases}
        //     renderItem={renderCard}
        //     keyExtractor={item => item.suspect_case_id.toString()}
        // />
        // <ScrollView contentContainerStyle={{flexGrow: 1}} style={{flex: 1}}>
        <View style={styles.centeredContainer}>
            {/* <View style={styles.card}>
                    <Text>Tes</Text>
                </View> */}
            {/* Render the cases in a FlatList for efficient rendering */}
            <FlatList
                data={cases}
                renderItem={card}
                keyExtractor={item => item.suspect_case_id.toString()}
            />

            {/* <View style={styles.buttonWrapper}>
                <Button
                    title="Scan"
                    onPress={() => navigation.navigate('Scan')}
                />
            </View>
            <View style={styles.buttonWrapper}>
                <Button
                    title="Scan Trial"
                    onPress={() => navigation.navigate('ScanV2')}
                />
            </View> */}

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
                                    style={styles.menuItem}>
                                    <Text style={styles.menuText}>
                                        Setting Print
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </View>
        // </ScrollView>
    );
};

const styles = StyleSheet.create({
    centeredContainer: {
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        paddingTop: 20,
    },
    title: {
        fontSize: 20,
    },
    buttonWrapper: {
        marginBottom: 10,
    },

    /* Card Styles */
    cardContainer: {
        flexDirection: 'row', // This allows for horizontal centering
        justifyContent: 'center', // Centers items horizontally
        alignItems: 'center', // Ensures vertical alignment as well (optional)
        width: '100%', // Ensures the container spans full width of its parent
        marginVertical: 15,
    },
    card: {
        width: '84%',
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        elevation: 5, // Adds shadow to the card (Android)
        shadowColor: '#000', // Adds shadow (iOS)
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#009688',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        flexShrink: 1,
    },

    /* Progress scan styles */
    progressContainer: {
        flexDirection: 'row', // This arranges the child elements side by side
        alignItems: 'center', // Vertically center the items if needed
        // marginTop: 3,
    },
    progressText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    progressBadge: {
        borderRadius: 20,
        backgroundColor: '#FF9800',
        paddingHorizontal: 15,
        paddingVertical: 4,
    },
    textContainer: {
        flexDirection: 'row', // Row direction to make texts align horizontally
        justifyContent: 'space-between', // Distributes space between the items
        alignItems: 'center', // Ensures vertical alignment in the middle
        width: '100%', // Takes full width of the container
    },

    // Style 3 dots navigation bar button
    headerButton: {
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: 'transparent',
    },
    headerButtonText: {
        fontSize: 30,
        color: '#000',
    },

    // Style modal navigation bar button
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    menuContainer: {
        width: 200,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 5,
    },
    menuItem: {
        padding: 15,
    },
    menuText: {
        fontSize: 16,
        color: '#000',
    },
});

export default MenuScreen;
