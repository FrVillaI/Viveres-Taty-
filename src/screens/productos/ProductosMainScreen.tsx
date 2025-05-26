import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set, update } from 'firebase/database';
import { db } from '../../firebase/firebaseConfig';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';
import FormularioProducto from '../../components/Productos/FormularioProducto';

interface Productos {
  id: string;
  imagen: string;
  nombre: string;
  precio: number;
}

const ProductosMainScreen = ({ navigation }: any) => {
  const [productos, setProductos] = useState<Productos[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredProductos, setFilteredProductos] = useState<Productos[]>([]);

  const [productoSeleccionado, setProductoSeleccionado] = useState<Productos | null>(null);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [modalFormularioVisible, setModalFormularioVisible] = useState(false);
  const [modoFormulario, setModoFormulario] = useState<'editar' | 'agregar'>('agregar');

  //Lista de productos desde Firebase
  useEffect(() => {
    const productsRef = ref(db, 'productos');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const productosData: Productos[] = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        productosData.push({
          id: childSnapshot.key,
          imagen: data.imagen,
          nombre: data.nombre,
          precio: data.precio,
        });
      });
      setProductos(productosData);
      setFilteredProductos(productosData);
    });

    return () => unsubscribe();
  }, []);

  //Lista de productos con el filtro
  useEffect(() => {
    if (searchTerm) {
      const filtered = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProductos(filtered);
    } else {
      setFilteredProductos(productos);
    }
  }, [searchTerm, productos]);

  // Producto selecionado
  const verDetalle = (producto: Productos) => {
    setProductoSeleccionado(producto);
    setModalDetalleVisible(true);
  };

  // Edicion de productos
  const editarProducto = () => {
    setModalDetalleVisible(false);
    setModoFormulario('editar');
    setModalFormularioVisible(true);
  };

  // Nuevo producto
  const agregarProducto = () => {
    setProductoSeleccionado(null)
    setModoFormulario('agregar');
    setModalFormularioVisible(true);
  };

  const eliminarProducto = () => {
    if (productoSeleccionado) {
      Alert.alert(
        "Confirmar eliminación",
        `¿Estás seguro de que deseas eliminar el producto "${productoSeleccionado.nombre}"?`,
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              const productoRef = ref(db, `productos/${productoSeleccionado.id}`);
              remove(productoRef)
                .then(() => {
                  Alert.alert("Éxito", "Producto eliminado.");
                  setModalDetalleVisible(false);
                })
                .catch((error) => {
                  Alert.alert("Error", "No se pudo eliminar el producto.");
                  console.error(error);
                });
            }
          }
        ]
      );
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Productos</Text>
      <View style={styles.searchContainer}>
        <AntDesign name="search1" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar productos..."
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
        />
      </View>

      <FlatList
        data={filteredProductos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard} onPress={() => verDetalle(item)}>
            <Text style={styles.productName}>{item.nombre}</Text>
            <Image source={{ uri: item.imagen }} style={styles.imagen} />
            <Text style={styles.productPrice}>${item.precio}</Text>
          </TouchableOpacity>
        )}
      />


      <TouchableOpacity onPress={() => agregarProducto()} style={styles.floatingButton}>
        <AntDesign name="plus" size={30} color="white" />
      </TouchableOpacity>

      <Modal visible={modalFormularioVisible == true} animationType="slide">
        <View style={styles.modalContainer}>
          <FormularioProducto
            producto={productoSeleccionado}
            modo={modoFormulario}
            onGuardar={(productoActualizado: any) => {
              if (modoFormulario === 'editar') {
                const productoRef = ref(db, `productos/${productoActualizado.id}`);
                update(productoRef, productoActualizado)
                  .then(() => {
                    Alert.alert("Éxito", "Producto actualizado.");
                    setModalFormularioVisible(false);
                  })
                  .catch((error) => {
                    Alert.alert("Error", "No se pudo actualizar.");
                    console.error(error);
                  });
              } else {
                const productosRef = ref(db, 'productos');
                const nuevoProductoRef = push(productosRef);
                set(nuevoProductoRef, {
                  nombre: productoActualizado.nombre,
                  precio: productoActualizado.precio,
                  imagen: productoActualizado.imagen,
                })
                  .then(() => {
                    Alert.alert("Éxito", "Producto agregado.");
                    setModalFormularioVisible(false);
                  })
                  .catch((error) => {
                    Alert.alert("Error", "No se pudo agregar.");
                    console.error(error);
                  });
              }
            }}
            onCancelar={() => { setModalFormularioVisible(false) }}
          />
        </View>
      </Modal>


      <Modal visible={modalDetalleVisible} animationType="slide">
        <View style={styles.container}>
          {productoSeleccionado && (
            <View style={styles.infoContainer}>
              <Text style={styles.nombre}>{productoSeleccionado.nombre}</Text>
              <Image source={{ uri: productoSeleccionado.imagen }} style={styles.imagen} />
              <Text style={styles.precio}>Precio: ${productoSeleccionado.precio}</Text>

              <TouchableOpacity style={[styles.botonModal, styles.editar]} onPress={editarProducto}>
                <Text style={styles.textoBoton}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.botonModal, styles.cancelar]} onPress={() => setModalDetalleVisible(false)}>
                <Text style={styles.textoBoton}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.botonModal, styles.eliminar]} onPress={eliminarProducto}>
                <Text style={styles.textoBoton}>Eliminar</Text>
              </TouchableOpacity>

            </View>
          )}
        </View>

      </Modal>


    </View>
  )
}

export default ProductosMainScreen

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
    marginTop: 35,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginBottom: 5,
    color: "#444",
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    width: "100%",
  },
  searchIcon: {
    marginRight: 10,
    color: "#666",
  },
  imagen: {
    width: 145,
    height: 170,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#ddd",
  },
  textoImagen: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    width: "90%",
  },
  nombre: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#444",
    textAlign: "center",
    marginBottom: 5,
  },
  precio: {
    fontSize: 18,
    fontWeight: "600",
    color: "#777",
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    margin: 8,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  productPrice: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "bold",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#007bff",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  botonModal: {
    width: "80%",
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  textoBoton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  editar: {
    backgroundColor: "#28a745",
  },
  cancelar: {
    backgroundColor: "#6c757d",
  },
  eliminar: {
    backgroundColor: "#dc3545",
  },
});
