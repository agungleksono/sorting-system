import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    TextInput,
    Button,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import api from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AutocompleteDropdown,
    AutocompleteDropdownContextProvider,
} from 'react-native-autocomplete-dropdown';
import {Table, Row, Rows} from 'react-native-table-component';

const ListSuspectScreen = ({navigation, route}) => {
    const {caseData} = route.params;
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    // const tableData = [
    //     ['Name', 'Age', 'Country', 'Country', 'Country', 'Country', 'Country'],
    //     ['John Doe', '28', 'USA', 'France', 'France', 'France'],
    //     ['Jane Smith', '32', 'UK', 'Swedish', 'France'],
    //     ['Samuel Johnson', '25', 'Canada', 'Japan', 'France'],
    // ];

    const tableHead = [
        'No.',
        'Part No.',
        'Lot No',
        'Box Id',
        'Container No',
        'Invoice No',
        caseData.scan_type_id == '001' ? 'Qty.' : 'Qty. Progress',
        'Status',
    ]; // Header
    // const tableData = [
    //     ['John Doe', '28', 'USA', 'France', 'France', 'France'],
    //     ['Jane Smith', '32', 'UK', 'Sweden', 'France', 'France'],
    //     ['Samuel Johnson', '25', 'Canada', 'Japan', 'France', 'France'],
    // ]; // Data
    const tableWidths = [50, 150, 150, 150, 150, 100, 100, 70, 100];

    const getListSuspect = async () => {
        try {
            setLoading(true); // Show loading spinner

            const {data} = await api.post('/suspects/list', {
                suspect_case_id: caseData.suspect_case_id,
            });

            const suspects = data.data;

            // Convert API response into table format (array of arrays)
            const formattedData = suspects.map((suspect, index) => [
                (index + 1).toString(),
                suspect.part_no,
                suspect.lot_no,
                suspect.box_id,
                suspect.container_no,
                suspect.invoice_no,
                caseData.scan_type_id == '001'
                    ? suspect.quantity ?? 0
                    : `${suspect.progress_quantity ?? 0} / ${
                          suspect.quantity ?? 0
                      }`,
                suspect.is_scanned == '1' ? 'NG' : '',
            ]);

            setTableData(formattedData);
        } catch (error) {
            console.error('Error getListSuspect():', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };

    useEffect(() => {
        getListSuspect();
    }, []);

    return (
        // <AutocompleteDropdownContextProvider>
        //     <ScrollView contentContainerStyle={{flexGrow: 1}} style={{flex: 1}}>
        //         <View style={styles.container}>
        //             <ScrollView horizontal={true}>
        //                 <View style={styles.table}>
        //                     {/* Table Header */}
        //                     <View style={styles.tableRow}>
        //                         {tableData[0].map((header, index) => (
        //                             <Text
        //                                 key={index}
        //                                 style={styles.tableHeader}>
        //                                 {header}
        //                             </Text>
        //                         ))}
        //                     </View>

        //                     {/* Table Data */}
        //                     {tableData.slice(1).map((row, rowIndex) => (
        //                         <View key={rowIndex} style={styles.tableRow}>
        //                             {row.map((cell, cellIndex) => (
        //                                 <Text
        //                                     key={cellIndex}
        //                                     style={styles.tableCell}>
        //                                     {cell}
        //                                 </Text>
        //                             ))}
        //                         </View>
        //                     ))}
        //                 </View>
        //             </ScrollView>
        //         </View>
        //     </ScrollView>
        // </AutocompleteDropdownContextProvider>
        <ScrollView style={styles.container}>
            <View style={styles.tableContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <ScrollView horizontal={true}>
                        <Table
                            borderStyle={{
                                borderWidth: 1,
                                borderColor: '#c8e1ff',
                            }}>
                            {/* Table Header */}
                            <Row
                                data={tableHead}
                                style={styles.head}
                                textStyle={styles.text}
                                widthArr={tableWidths}
                            />

                            {/* Table Data */}
                            <Rows
                                data={tableData}
                                textStyle={styles.text}
                                widthArr={tableWidths}
                            />
                        </Table>
                    </ScrollView>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     marginTop: 20,
    // },
    // table: {
    //     marginHorizontal: 10,
    // },
    // tableRow: {
    //     flexDirection: 'row',
    //     borderBottomWidth: 1,
    //     borderBottomColor: '#ddd',
    //     paddingVertical: 10,
    //     paddingHorizontal: 5,
    // },
    // tableHeader: {
    //     flex: 1,
    //     fontWeight: 'bold',
    //     textAlign: 'center',
    //     padding: 5,
    // },
    // tableCell: {
    //     flex: 1,
    //     textAlign: 'center',
    //     padding: 5,
    // },

    container: {
        flex: 1,
        marginTop: 20,
    },
    tableContainer: {
        margin: 10,
    },
    head: {
        height: 40,
        backgroundColor: '#f1f8ff',
    },
    text: {
        margin: 6,
        textAlign: 'center',
        fontSize: 14, // Example font size for consistency
    },
});

export default ListSuspectScreen;
