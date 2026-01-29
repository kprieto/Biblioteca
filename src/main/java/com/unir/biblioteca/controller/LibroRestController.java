package com.unir.biblioteca.controller;

import com.unir.biblioteca.dto.AquilarRequest;
import com.unir.biblioteca.model.Critica;
import com.unir.biblioteca.model.Libro;
import com.unir.biblioteca.model.Aquilar;
import com.unir.biblioteca.repository.CriticaRepository;
import com.unir.biblioteca.elastic.LibroElasticRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import com.unir.biblioteca.repository.AquilarRepository;
import com.unir.biblioteca.repository.LibroRepository;

import java.net.URI;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/libros")
public class LibroRestController {

    @Autowired
    private final AquilarRepository aquilarRepository;
    private final LibroRepository libroRepository;
    private final CriticaRepository criticaRepository;
    private final LibroElasticRepository elasticRepository;

    public LibroRestController(AquilarRepository aquilarRepository, LibroRepository libroRepository, CriticaRepository criticaRepository, LibroElasticRepository elasticRepository) {
        this.aquilarRepository = aquilarRepository;
        this.libroRepository = libroRepository;
        this.criticaRepository = criticaRepository;
        this.elasticRepository = elasticRepository;
    }

    /*Lista todos los libros*/
    @GetMapping
    public ResponseEntity<List<Libro>> listAll() {
        return ResponseEntity.ok(libroRepository.findAll());
    }


    /* Endpoint de búsqueda rápida en Elasticsearch */
    @GetMapping("/search")
    public List<Libro> search(@RequestParam String busqueda) {
        return elasticRepository.findByTituloContainingOrAutorContaining(busqueda, busqueda);
    }

    /* Crear libro */
    @PostMapping
    public ResponseEntity<?> createLibro(@RequestBody Libro nuevoLibro, UriComponentsBuilder ucb) {
        Libro libroGuardado = libroRepository.save(nuevoLibro);

        // Contruir la URI del nuevo libro
        URI uriLibro = ucb
                .path("/api/libros/{id}")
                .buildAndExpand(libroGuardado.getId())
                .toUri();
        Map<String, Object> response = new HashMap<>();
        response.put("message", " Libro creado exitosamente.");
        response.put("libro", libroGuardado);
        return ResponseEntity.created(uriLibro).body(response);
    }

    /* Obtener un libro por su ID */
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        Optional<Libro> libro = libroRepository.findById(id);
        if (libro.isPresent()){
            return ResponseEntity.ok(libro.get());
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Libro con ID " + id + " no encontrado");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /* Actualizar un libro por su ID */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLibro(@RequestBody Libro libroActualizado, @PathVariable Long id) {
        return ResponseEntity.ok(libroRepository.findById(id)
                .map(libro -> {
                    libro.setAutor(libroActualizado.getAutor());
                    libro.setDisponible(libroActualizado.isDisponible());
                    libro.setAnioPublicacion(libroActualizado.getAnioPublicacion());
                    libro.setTitulo(libroActualizado.getTitulo());
                    libro.setSinopsis(libroActualizado.getSinopsis());
                    libro.setIsbn10(libroActualizado.getIsbn10());
                    libro.setIsbn13(libroActualizado.getIsbn13());
                    libro.setImagenPortada(libroActualizado.getImagenPortada());
                    libroRepository.save(libro);

                    return ResponseEntity.ok().body("Libro con ID " + id + " actualizado exitosamente.");
                }).orElseGet(() -> {
                    libroRepository.save(libroActualizado);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Libro con ID " + id + " no encontrado. No se puede actualizar.");
                }));
    }

    /* Eliminar un libro por su ID */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLibro(@PathVariable Long id) {
        Optional<Libro> libro = libroRepository.findById(id);

        if (libro.isPresent()) {
            libroRepository.deleteById(id);
            return ResponseEntity.ok().body("Libro con ID " + id + " eliminado exitosamente.");
        } else {
            return ResponseEntity.ok().body("Libro con ID " + id + " no encontrado.");
        }
    }

    /* Aquilar un libro */
    @PostMapping("/{id}/alquilar")
    public ResponseEntity<String> rentLibro(@PathVariable Long id, @RequestBody AquilarRequest req) {
        return libroRepository.findById(id).map(libro -> {
            if (!libro.isDisponible()) return ResponseEntity.badRequest().body("El libro ya está alquilado.");

            // Validar restricción de 7 días
            long dias = ChronoUnit.DAYS.between(req.fechaInicio, req.fechaFin);
            if (dias > 7) {
                return ResponseEntity.badRequest().body("El periodo no puede superar los 7 días.");
            }
            if (dias < 0) {
                return ResponseEntity.badRequest().body("La fecha de fin debe ser posterior a la fecha de inicio.");
            }


            libro.setDisponible(false);


            Aquilar aquilar = new Aquilar();
            //aquilar.setLibroId(id);
            aquilar.setLibro(libro);
            aquilar.setUsuarioNombre(req.usuario);
            aquilar.setFechaInicio(req.fechaInicio);
            aquilar.setFechaFin(req.fechaFin);
            aquilarRepository.save(aquilar);
            //libro.setAlquilerActivo(aquilar);
            libroRepository.save(libro);
            return ResponseEntity.ok("Alquiler registrado exitosamente");
        }).orElse(ResponseEntity.notFound().build());
    }

    /* Devolver libro */
    @PostMapping("/{id}/devolver")
    public ResponseEntity<String> returnLibro(@PathVariable Long id) {
        return libroRepository.findById(id).map(libro -> {
            libro.setDisponible(true);
            libroRepository.save(libro);
            return ResponseEntity.ok("Libro Devuelto.");
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/criticas")
    public ResponseEntity<List<Critica>> listCriticas(@PathVariable Long id) {
        // Verificamos si el libro existe primero (opcional pero recomendado)
        if (!libroRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<Critica> lista = criticaRepository.findByLibroIdOrderByFechaDesc(id);
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/{id}/criticas")
    public ResponseEntity<Critica> addCritica(@PathVariable Long id, @RequestBody Critica critica) {
        return libroRepository.findById(id).map(libro -> {
            critica.setLibro(libro);

            // La fecha se asigna automáticamente en la entidad si es null
            if (critica.getFecha() == null) critica.setFecha(LocalDate.now());

            return ResponseEntity.ok(criticaRepository.save(critica));
        }).orElse(ResponseEntity.notFound().build());
    }





}
