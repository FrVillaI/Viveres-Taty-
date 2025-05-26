import React from 'react'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ProductosMainScreen from '../screens/productos/ProductosMainScreen';
import DeudasMainScreen from '../screens/deudas/DeudasMainScreen';
import PedidosMainScreen from '../screens/pedidos/PedidosMainScreen';
import { Ionicons } from '@expo/vector-icons';
import DetalleDeudaScreen from '../screens/deudas/DetalleDeudaScreen';
import EditarDuedaScreen from '../screens/deudas/EditarDuedaScreen';
import NuevaDuedaScreen from '../screens/deudas/NuevaDuedaScreen';
import EditarPedidosScreen from '../screens/pedidos/EditarPedidosScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack para manejar las pantallas de productos
function ProductosStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="ProductosMain" component={ProductosMainScreen} options={{ headerShown: false }} />

        </Stack.Navigator>
    );
}

// Stack para manejar las pantallas de deudas
function DeudasStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="DeudasMain" component={DeudasMainScreen} options={{ headerShown: false }} />
            <Stack.Screen name="DetalleDeuda" component={DetalleDeudaScreen} />
            <Stack.Screen name="EditarDeuda" component={EditarDuedaScreen} />
            <Stack.Screen name="NuevaDeuda" component={NuevaDuedaScreen} />
        </Stack.Navigator>
    );
}

// Stack para manejar las pantallas de pedidos
function PedidosStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="PedidosMain" component={PedidosMainScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditarPedidos" component={EditarPedidosScreen} />
        </Stack.Navigator>
    );
}

// Tabs principales
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

                    if (route.name === 'Productos') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Deudas') {
                        iconName = focused ? 'cash' : 'cash-outline';
                    } else if (route.name === 'Pedidos') {
                        iconName = focused ? 'receipt' : 'receipt-outline';
                    } 

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'blue',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Productos" component={ProductosStack} options={{ headerShown: false }} />
            <Tab.Screen name="Deudas" component={DeudasStack} options={{ headerShown: false }} />
            <Tab.Screen name="Pedidos" component={PedidosStack} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}

// Agregar el NavigationContainer
export default function MainNavigators() {
    return (
        <NavigationContainer>
            <MainTabs />
        </NavigationContainer>
    );
}
