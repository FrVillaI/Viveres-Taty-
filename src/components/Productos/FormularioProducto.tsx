import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker';
import { API_CLOUDINARY, CLOUDINARY_UPLOAD_PRESET } from '@env';

const FormularioProducto = ({ producto = {}, modo, onGuardar, onCancelar }: any) => {
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [imagen, setImagen] = useState("");
    const [imagenLocal, setImagenLocal] = useState("");

    useEffect(() => {
        if (producto) {
            setNombre(producto.nombre || '');
            setPrecio(producto.precio?.toString() || '');
            setImagen(producto.imagen || '');
        } else {
            setNombre('');
            setPrecio('');
            setImagen('');
        }
    }, [producto]);

    const seleccionarImagen = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImagen(uri);
            setImagenLocal(uri);
        }
    };

    const subirACloudinary = async (): Promise<string | null> => {
        if (!imagenLocal) return imagen;

        const data = new FormData();
        data.append("file", {
            uri: imagenLocal,
            type: "image/jpeg",
            name: "foto.jpg",
        } as any);
        data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(API_CLOUDINARY, {
                method: "POST",
                body: data,
            });

            const result = await response.json();
            return result.secure_url || null;
        } catch (error) {
            console.error("Error al subir imagen:", error);
            return null;
        }
    };

    const handleGuardar = async () => {
        if (!nombre || !precio) {
            Alert.alert("Error", "Por favor completa todos los campos.");
            return;
        }

        let imagenFinal = imagen;
        if (imagenLocal) {
            const urlSubida = await subirACloudinary();
            if (!urlSubida) {
                Alert.alert("Error", "No se pudo subir la imagen.");
                return;
            }
            imagenFinal = urlSubida;
        }

        onGuardar({
            ...producto,
            nombre,
            precio: parseFloat(precio),
            imagen: imagenFinal,
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{modo === 'agregar' ? 'Agregar Producto' : 'Editar Producto'}</Text>

            {imagen ? (
                <Image source={{ uri: imagen }} style={styles.image} />
            ) : (
                <Text style={styles.noImageText}>No hay imagen</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={seleccionarImagen}>
                <Text style={styles.buttonText}>Subir Imagen</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Nombre:</Text>
            <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del producto"
            />

            <Text style={styles.label}>Precio:</Text>
            <TextInput
                style={styles.input}
                value={precio}
                onChangeText={setPrecio}
                keyboardType='numeric'
                placeholder="Precio en USD"
            />

            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleGuardar}>
                <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancelar}>
                <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        alignSelf: 'center',
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 15,
        borderRadius: 10,
    },
    noImageText: {
        fontStyle: 'italic',
        color: '#888',
        marginBottom: 15,
        alignSelf: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        marginVertical: 5,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#28a745',
    },
    cancelButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default FormularioProducto;
