import React, { useState, useEffect } from 'react';
import {
    Book as BookIcon,
    Plus,
    Edit2,
    Trash2,
    Search,
    ChevronLeft,
    Calendar,
    Hash,
    User,
    CheckCircle2,
    XCircle,
    BookOpen,
    Loader2,
    RefreshCw,
    MessageSquare,
    Star,
    Send,
    UserCircle,
    Info,
    AlertTriangle,
    Clock
} from 'lucide-react';

const App = () => {
    const currentYear = new Date().getFullYear();
    const fecha = new Date().toLocaleDateString();
    const getTodayDate = () => new Date().toLocaleDateString('en-CA');

    const [libros, setLibros] = useState([]);
    const [vista, setVista] = useState('list'); // 'list', 'form', 'details'
    const [selectedLibro, setSelectedLibro] = useState(null);
    const [criticas, setCriticas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [criticasLoading, setCriticasLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formSubmitted, setFormSubmitted] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [libroToDelete, setLibroToDelete] = useState(null);

    const [showAquilarForm, setShowAquilarForm] = useState(false);
    const [aquilarData, setAquilarData] = useState({
        usuario: '',
        fechaInicio: getTodayDate(),
        fechaFin: ''
    });

    const [showCriticaForm, setShowCriticaForm] = useState(false);
    const [criticaFormData, setCriticaFormData] = useState({
        usuario: '',
        comentario: '',
        calificacion: 5
    });

    const [formData, setFormData] = useState({
        titulo: '',
        autor: '',
        anioPublicacion: '',
        isbn10: '',
        isbn13: '',
        imagenPortada: '',
        sinopsis: '',
        disponible: true
    });

    // URL base gestionada por el proxy de Vite
    const API_URL = '/api/libros';

    // Carga inicial al montar el componente
    useEffect(() => {
        if (searchTerm.trim() === '') {
            fetchLibros();
        } else {
            const delayDebounceFn = setTimeout(() => {
                searchElasticsearch(searchTerm);
            }, 500);

            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchTerm]);

    /**
     * CARGAR LIBROS DESDE EL REST CONTROLLER (SPRING BOOT)
     */
    const fetchLibros = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setLibros(data);
        } catch (e) { console.error("Error al cargar libros:", e); }
        finally { setLoading(false); }
    };

    /**
     * Consulta al motor de búsqueda Elasticsearch
     */
    const searchElasticsearch = async (query) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setLibros(data);
            }
        } catch (e) { console.error("Error en búsqueda ES:", e); }
        finally { setLoading(false); }
    };

    /**
     * Determina el estado del libro basándose en la fecha de vencimiento (fechaFin del alquiler)
     */
    const getLibroStatus = (libro) => {
        if (!libro) return { label: '', color: '', textColor: '', isLate: false };

        if (libro.disponible) {
            return {
                label: 'Estado: Disponible para alquilar',
                color: 'bg-emerald-500',
                textColor: 'text-emerald-600',
                isLate: false
            };
        }


        if (libro.fechaFin) {

            const hoy = new Date();

            hoy.setHours(0, 0, 0, 0);

            const fechaLimite = new Date(libro.fechaFin);
            fechaLimite.setHours(0, 0, 0, 0);

            if (hoy > fechaLimite) {
                return {
                    label: 'Estado: Retraso en el alquiler',
                    color: 'bg-rose-600 animate-pulse',
                    textColor: 'text-rose-600',
                    isLate: true
                };
            }
        }

        return {
            label: 'Estado: No disponible (Alquilado)',
            color: 'bg-amber-500',
            textColor: 'text-amber-600',
            isLate: false
        };
    };

    /**
     * CARGAR CRITICAS DESDE EL REST CONTROLLER (SPRING BOOT)
     */
    const fetchCriticas = async (libroId) => {
        if (!libroId) return;
        setCriticasLoading(true);
        // Limpiamos críticas anteriores para no mostrar datos viejos
        setCriticas([]);
        try {
            const response = await fetch(`${API_URL}/${libroId}/criticas`);
            if (response.ok) {
                const data = await response.json();
                // Verificamos que data sea un array
                setCriticas(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error("Error al obtener críticas del servidor:", e);
            setCriticas([]);
        } finally {
            setCriticasLoading(false);
        }
    };

    /** VER LOS DETALLES DEL LIBRO Y LAS CRITICAS **/
    const handleVerDetalles = (libro) => {
        setSelectedLibro(libro);
        setVista('details');
        // DISPARAR LA CARGA DE CRÍTICAS INMEDIATAMENTE
        fetchCriticas(libro.id);
        // Resetear formularios
        setShowCriticaForm(false);
        setCriticaFormData({ usuario: '', comentario: '', calificacion: 5 });
        setAquilarData({
            usuario: '',
            fechaInicio: getTodayDate(),
            fechaFin: ''
        });
    };

    /**
     * GUARDAR LAS CRITICAS DEL LIBRO EN LA BASE DE DATOS
     */
    const submitCritica = async (e) => {
        e.preventDefault();
        if (!selectedLibro || !criticaFormData.usuario || !criticaFormData.comentario) return;

        setActionLoading(true);
        try {
            const response = await fetch(`${API_URL}/${selectedLibro.id}/criticas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...criticaFormData,
                    fecha: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD para Java
                })
            });

            if (response.ok) {
                setShowCriticaForm(false);
                setCriticaFormData({ usuario: '', comentario: '', calificacion: 5 });
                // Recargar la lista de críticas inmediatamente
                await fetchCriticas(selectedLibro.id);
            }
        } catch (e) {
            console.error("Error guardando crítica:", e);
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * PROCESO DE AQUILER DE UN LIBRO
     */

    const handleAquilarSubmit = async (e) => {
        e.preventDefault();
        if (!aquilarData.usuario || !aquilarData.fechaInicio || !aquilarData.fechaFin) return;

        // Validación extra en cliente
        const start = new Date(aquilarData.fechaInicio);
        const end = new Date(aquilarData.fechaFin);
        const diff = (end - start) / (1000 * 60 * 60 * 24);

        if (diff < 0) return alert("La fecha de fin debe ser posterior al inicio.");
        if (diff > 7) return alert("El préstamo no puede exceder los 7 días.");

        setActionLoading(true);
        try {
            const response = await fetch(`${API_URL}/${selectedLibro.id}/alquilar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aquilarData)
            });

            const result = await response.text();
            if (response.ok) {
                await fetchLibros();
                setSelectedLibro({...selectedLibro, disponible: false, fechaFin: aquilarData.fechaFin});
                setShowAquilarForm(false);
                setAquilarData({ usuario: '', fechaInicio: getTodayDate(), fechaFin: '' });
            } else {
                alert(result);
            }
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    /**
     * GUARDAR O ACTUALIZAR LIBRO EN LA BASE DE DATOS
     */
    const handleSave = async (e) => {
        e.preventDefault();

        setFormSubmitted(true);
        if (!formData.titulo || !formData.autor || !formData.anioPublicacion || !formData.imagenPortada || !formData.sinopsis) return;

        setActionLoading(true);


        const { criticas: _, ...datosAEnviar } = formData;

        const method = selectedLibro ? 'PUT' : 'POST';
        const url = selectedLibro ? `${API_URL}/${selectedLibro.id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosAEnviar)
            });

            if (response.ok) {
                await fetchLibros();
                setVista('list');
                resetForm();
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * ABRE EL MODAL DE CONFIRMACIÓN
     */
    const openDeleteModal = (libro) => {
        setLibroToDelete(libro);
        setIsDeleteModalOpen(true);
    };

    /**
     * EJECUTA LA ELIMINACIÓN REAL
     */
    const confirmDelete = async () => {
        if (!libroToDelete) return;
        setActionLoading(true);
        try {
            const response = await fetch(`${API_URL}/${libroToDelete.id}`, { method: 'DELETE' });
            if (response.ok) {
                setLibros(prev => prev.filter(b => b.id !== libroToDelete.id));
                setIsDeleteModalOpen(false);
                setLibroToDelete(null);
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        } finally {
            setActionLoading(false);
        }
    };



    /**
     * PROCESO DE DEVOLUCIÓN
     */
    const handleReturn = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}/devolver`, { method: 'POST' });
            if (response.ok) {
                await fetchLibros();
                if (selectedLibro) setSelectedLibro(prev => ({...prev, disponible: true}));
            }
        } catch (error) {
            console.error("Error al devolver:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            titulo: '', autor: '', anioPublicacion: '',
            isbn10: '', isbn13: '', imagenPortada: '',
            sinopsis: '', disponible: true
        });
        setSelectedLibro(null);
        setFormSubmitted(false);
        setAquilarData({
            usuario: '',
            fechaInicio: getTodayDate(),
            fechaFin: ''
        });

    };

    const openEdit = (libro) => {
        setSelectedLibro(libro);
        setFormData(libro);
        setShowCriticaForm(false);
        setVista('form');
        setShowAquilarForm(false);
        fetchCriticas(libro.id);
        setFormSubmitted(false);

    };

    const filteredLibros = libros.filter(b =>
        b.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.autor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /**
     * Validador específico para ISBN 10
     * Permite solo letras y números, máximo 10 caracteres.
     */
    const handleIsbn10Change = (e) => {
        const value = e.target.value;
        const isAlphanumeric = /^[a-zA-Z0-9]*$/.test(value);

        if (isAlphanumeric && value.length <= 10) {
            setFormData({ ...formData, isbn10: value });
        }
    };

    /**
     * Validador específico para ISBN 13
     * Permite solo letras y números, máximo 13 caracteres.
     */
    const handleIsbn13Change = (e) => {
        const value = e.target.value;
        const isAlphanumeric = /^[a-zA-Z0-9]*$/.test(value);

        if (isAlphanumeric && value.length <= 13) {
            setFormData({ ...formData, isbn13: value });
        }
    };

    /**
     * Validador de campos requeridos
     */
    const getInputClasses = (fieldName, isRequired = false) => {
        const base = "w-full px-4 py-3 border-2 rounded-xl outline-none transition-all font-medium text-slate-800";
        const invalid = isRequired && formSubmitted && !formData[fieldName];
        return `${base} ${invalid ? 'border-rose-500 bg-rose-50' : 'border-slate-100 bg-slate-50/50 focus:border-indigo-500 focus:bg-white'}`;
    };

    return (

        <div className="min-h-[100dvh] w-full bg-slate-50 text-slate-900 font-sans flex flex-col">

            {/* Header Responsivo */}
            <header className="bg-white border-b sticky top-0 z-20 shadow-sm w-full">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setVista('list'); resetForm(); }}>
                        <div className="bg-indigo-600 p-2 sm:p-2.5 rounded-xl shadow-indigo-100 shadow-lg">
                            <BookIcon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-800">Biblio<span className="text-indigo-600">Digital</span></h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={fetchLibros}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                            title="Sincronizar"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => { resetForm(); setVista('form'); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-indigo-200 active:scale-95 text-sm sm:text-base font-bold"
                        >
                            <Plus size={18} />
                            <span className="xs:inline">Nuevo Libro</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenido Principal Flexible */}
            <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10">

                {/* VISTA DE LISTA */}
                {vista === 'list' && (
                    <section className="w-full h-full animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row gap-6 mb-8 sm:mb-12 items-start md:items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl sm:text-4xl font-black text-slate-900">Catálogo Digital</h2>
                                <p className="text-slate-500 text-sm sm:text-base">Gestiona tu colección de libros</p>
                            </div>
                            <div className="relative w-full md:w-96 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Búsqueda inteligente..."
                                    className="w-full pl-12 pr-4 py-3 sm:py-3.5 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
                                <Loader2 className="animate-spin text-indigo-600" size={48} />
                                <p className="font-bold tracking-widest text-xs uppercase">Conectando con el servidor...</p>
                            </div>
                        ) : filteredLibros.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 flex flex-col items-center gap-4">
                                <BookIcon size={48} className="opacity-20" />
                                <p className="text-lg font-medium">No se encontraron libros disponibles.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
                                {filteredLibros.map(libro => {
                                    const status = getLibroStatus(libro);
                                    return (
                                        <div key={libro.id} className="bg-white rounded-3xl border overflow-hidden hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full" onClick={() => handleVerDetalles(libro)}>
                                            <div className="aspect-[3/4] relative overflow-hidden">
                                                <img
                                                    src={libro.imagenPortada || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600"}
                                                    alt={libro.titulo}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute top-4 right-4">
                                                    <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md text-white ${status.color}`}>
                                                        {status.label.replace('Estado: ', '').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 truncate">{libro.titulo}</h3>
                                                <p className="text-slate-500 text-sm mb-6 font-medium">{libro.autor}</p>
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                                    <button onClick={(e) => { e.stopPropagation(); handleVerDetalles(libro); }} className="group bg-slate-50 hover:bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold border-2 border-indigo-100 transition-colors flex items-center gap-2">
                                                        <BookOpen size={16} /> Ver detalles
                                                    </button>
                                                    <div className="flex gap-1">
                                                        <button onClick={(e) => { e.stopPropagation(); openEdit(libro); }}  className="group bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-xl font-bold border-2 border-indigo-100 flex items-center gap-2 transition-all"><Edit2 size={18} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); openDeleteModal(libro); }} className="group bg-slate-50 hover:text-rose-600 text-indigo-600 rounded-xl font-bold border-2 border-indigo-100 flex items-center gap-2 transition-all "><Trash2 size={18} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* VISTA DE DETALLES */}
                {vista === 'details' && selectedLibro && (
                    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <button onClick={() => setVista('list')} className="group bg-slate-50 hover:bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold border-2 border-indigo-100 transition-colors flex items-center gap-2">
                            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Volver al Catálogo</span>
                        </button>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl flex flex-col lg:flex-row overflow-hidden min-h-[500px]">
                            <div className="lg:w-2/5 h-[400px] lg:h-auto">
                                <img src={selectedLibro.imagenPortada} className="w-full h-full object-cover" alt={selectedLibro.titulo} />
                            </div>
                            <div className="lg:w-3/5 p-8 sm:p-12 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase">{selectedLibro.anioPublicacion}</span>
                                        <span className="text-slate-300">/</span>
                                        <span className="text-slate-400 text-xs font-mono">ISBN 10: {selectedLibro.isbn10 || 'N/A'}</span>
                                        <span className="text-slate-400 text-xs font-mono">ISBN 13: {selectedLibro.isbn13 || 'N/A'}</span>
                                    </div>
                                    <h2 className="text-3xl sm:text-5xl font-black mb-4 text-slate-900 leading-tight">{selectedLibro.titulo}</h2>
                                    <p className="text-xl sm:text-2xl text-slate-500 mb-10 font-medium">Escrito por <span className="text-slate-800">{selectedLibro.autor}</span></p>


                                    {/* ALERTA DE RETRASO VISIBLE EN DETALLES */}
                                    {!selectedLibro.disponible && getLibroStatus(selectedLibro).isLate && (
                                        <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-4 text-rose-700">
                                            <Clock className="animate-pulse" />
                                            <div>
                                                <p className="font-bold">ESTE LIBRO TIENE UN RETRASO</p>
                                                <p className="text-xs opacity-80">Fecha límite: {selectedLibro.fechaFin}</p>
                                                <p className="text-xs opacity-80">Usuario: {selectedLibro.}</p>
                                            </div>
                                        </div>                                    )}
                                    <div className="space-y-4">
                                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest border-l-4 border-indigo-600 pl-3">Resumen / Sinopsis</h4>
                                        <p className="text-slate-600 leading-relaxed text-base sm:text-lg italic">"{selectedLibro.sinopsis || 'Este ejemplar no cuenta con una descripción detallada registrada.'}"</p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-10 mt-12">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                        {/* INTEGRACIÓN DINÁMICA DE ESTADO */}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full animate-pulse ${getLibroStatus(selectedLibro).color}`}></div>
                                            <span className={`font-black text-xs sm:text-sm tracking-widest uppercase ${getLibroStatus(selectedLibro).textColor}`}>
                                                {getLibroStatus(selectedLibro).label}
                                            </span>
                                        </div>

                                        <div className="flex gap-4 w-full sm:w-auto">
                                            {selectedLibro.disponible ? (
                                                <button onClick={() => setShowAquilarForm(!showAquilarForm)} className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                                                    <Calendar size={20} /> {showAquilarForm ? 'Cancelar' : 'Alquilar Ahora'}
                                                </button>
                                            ) : (
                                                <button onClick={() => handleReturn(selectedLibro.id)} className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all">
                                                    Registrar Devolución
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {/* FORMULARIO DE ALQUILER POR FECHAS */}
                                    {showAquilarForm && selectedLibro.disponible && (
                                        <div className="mt-8 bg-indigo-50/50 p-6 rounded-3xl animate-in slide-in-from-top-4 border border-indigo-100">
                                            <div className="flex items-center gap-2 text-indigo-600 mb-6 font-bold text-sm">
                                                <Info size={16} /> Máximo 7 días de alquiler.
                                            </div>
                                            <form onSubmit={handleAquilarSubmit} className="space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tu Nombre</label>
                                                        <input required className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400" value={aquilarData.usuario} onChange={e => setAquilarData({...aquilarData, usuario: e.target.value})} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fecha de Inicio</label>
                                                        <input type="date" required className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl outline-none" value={aquilarData.fechaInicio} onChange={e => setAquilarData({...aquilarData, fechaInicio: e.target.value})} min={getTodayDate()} />
                                                    </div>
                                                    <div className="space-y-1 sm:col-span-2">
                                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fecha de Fin (Máx +7 días)</label>
                                                        <input
                                                            type="date"
                                                            required
                                                            className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                                                            value={aquilarData.fechaFin}
                                                            onChange={e => setAquilarData({...aquilarData, fechaFin: e.target.value})}
                                                            min={aquilarData.fechaInicio}
                                                        />
                                                    </div>
                                                </div>
                                                <button type="submit" disabled={actionLoading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                                    {actionLoading && <Loader2 className="animate-spin" size={20} />} Confirmar Préstamo
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                        {/* SECCIÓN DE CRÍTICAS */}
                        <section className="bg-white rounded-[2rem] p-8 sm:p-12 border border-slate-100 shadow-xl">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="text-indigo-600" size={28} />
                                    <h3 className="text-2xl font-black">Críticas y Reseñas</h3>
                                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">{criticas.length}</span>
                                </div>
                                <button
                                    onClick={() => setShowCriticaForm(!showCriticaForm)}
                                    className="bg-slate-50 hover:bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold border-2 border-indigo-100 transition-colors flex items-center gap-2"
                                >
                                    <Star size={18} /> {showCriticaForm ? 'Cancelar' : 'Escribir Crítica'}
                                </button>
                            </div>

                            {/* Formulario de Crítica */}
                            {showCriticaForm && (
                                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 sm:p-12 shadow-2xl">
                                    <form onSubmit={submitCritica} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-slate-400 ml-1">Tu Nombre</label>
                                                <input required className="w-full px-5 py-3.5 border-2 border-slate-50 bg-slate-50/50 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono" value={criticaFormData.usuario} onChange={e => setCriticaFormData({...criticaFormData, usuario: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-slate-400 ml-1">Calificación</label>
                                                <div className="flex gap-1 ">
                                                    {[1,2,3,4,5].map(s => (
                                                        <button type="button" key={s} onClick={() => setCriticaFormData({...criticaFormData, calificacion: s})} className="transition-transform hover:scale-110 border-2 border-slate-50 bg-slate-50/35">
                                                            <Star size={24} className={s <= criticaFormData.calificacion ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400 ml-1">Comentario</label>
                                            <textarea required rows="3" className="w-full px-5 py-3.5 border-2 border-slate-50 bg-slate-50/50 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono resize-none" value={criticaFormData.comentario} onChange={e => setCriticaFormData({...criticaFormData, comentario: e.target.value})} />
                                        </div>
                                        <button type="submit" disabled={actionLoading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
                                            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Publicar Crítica
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Lista de Críticas */}
                            {criticasLoading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
                            ) : (
                                <div className="space-y-6">
                                    {criticas.length === 0 ? (
                                        <div className="text-center py-10 text-slate-400 italic">Aún no hay críticas para este libro. ¡Sé el primero en opinar!</div>
                                    ) : (
                                        // NOTA: Si el backend ya ordena por fecha DESC, no necesitas .reverse()
                                        criticas.map(rev => (
                                            <div key={rev.id} className="border-b border-slate-50 pb-6 flex gap-4 animate-in slide-in-from-left-4">
                                                <div className="hidden sm:block"><UserCircle className="text-slate-200" size={44} /></div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-black text-slate-800">{rev.usuario}</h4>
                                                        <div className="flex gap-0.5">
                                                            {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= rev.calificacion ? "fill-amber-400 text-amber-400" : "text-slate-100"} />)}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 text-sm leading-relaxed mb-2">{rev.comentario}</p>
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{rev.fecha}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </section>

                    </div>


                )}

                {/* VISTA DE FORMULARIO */}
                {vista === 'form' && (
                    <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
                        <button onClick={() => setVista('list')} className="bg-slate-50 hover:bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold border-2 border-indigo-100 transition-colors flex items-center gap-2">
                            <ChevronLeft size={24} /> Cancelar y salir
                        </button>
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 sm:p-12 shadow-2xl">
                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedLibro ? 'Editar Libro' : 'Añadir Libro'}</h2>
                                <p className="text-slate-500">Completa los campos.</p>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6" noValidate>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Título del Libro</label>
                                        <input
                                            required
                                            className={getInputClasses('titulo', true)}
                                            value={formData.titulo}
                                            onChange={e => setFormData({...formData, titulo: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Autor</label>
                                        <input required className={getInputClasses('autor', true)} value={formData.autor} onChange={e => setFormData({...formData, autor: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Año de Publicación</label>
                                        <input type="number" required className={getInputClasses('anioPublicacion', true)} value={formData.anioPublicacion} onChange={e => setFormData({...formData, anioPublicacion: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                            <span>Código ISBN 10 </span>
                                            <span className={`${formData.isbn10.length === 10 ? 'text-emerald-500' : 'text-slate-300'}`}>{formData.isbn10.length}/10</span>
                                        </label>
                                        <input
                                            placeholder="Ej: 0307474720"
                                            className="w-full px-5 py-3.5 border-2 border-slate-50 bg-slate-50/50 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                                            value={formData.isbn10}
                                            onChange={handleIsbn10Change}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                            <span>Código ISBN 13 </span>
                                            <span className={`${formData.isbn13.length === 13 ? 'text-emerald-500' : 'text-slate-300'}`}>{formData.isbn13.length}/13</span>
                                        </label>
                                        <input
                                            placeholder="Ej: 0307474720345"
                                            className="w-full px-5 py-3.5 border-2 border-slate-50 bg-slate-50/50 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                                            value={formData.isbn13}
                                            onChange={handleIsbn13Change}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">URL de la Portada</label>
                                    <input required className={getInputClasses('imagenPortada', true)} value={formData.imagenPortada} placeholder="https://unsplash.com/photos/..." onChange={e => setFormData({...formData, imagenPortada: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Resumen / Sinopsis</label>
                                    <textarea required rows="4" className={getInputClasses('sinopsis', true)} value={formData.sinopsis} onChange={e => setFormData({...formData, sinopsis: e.target.value})} />
                                </div>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                                    <span>{selectedLibro ? 'Guardar Cambios' : 'Confirmar Registro'}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL DE ELIMINACIÓN */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="bg-rose-50 p-4 rounded-full">
                                <AlertTriangle className="text-rose-600 w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">¿Eliminar Libro?</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                Estás a punto de borrar <span className="text-slate-900 font-bold">"{libroToDelete?.titulo}"</span>.
                                Esta acción es permanente y no se podrá deshacer desde la base de datos.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-10">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={actionLoading}
                                className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                Eliminar libro
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Responsivo */}
            <footer className="w-full bg-white border-t border-slate-100 py-10 px-4">
                <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-400">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">Status: Conexión Activa con MySQL</span>
                    </div>
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase">
                        &copy; {currentYear} Biblioteca Digital • Gestión de préstamos
                    </p>

                </div>
            </footer>
        </div>
    );
};

export default App;