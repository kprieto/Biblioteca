package com.unir.biblioteca.controller;

import com.unir.biblioteca.model.Libro;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.unir.biblioteca.repository.AquilarRepository;
import com.unir.biblioteca.repository.LibroRepository;

import java.util.List;

@RestController
@RequestMapping("/api/aquilar")
@CrossOrigin(origins = "*")
public class AquilarRestController {

    @Autowired
    private final LibroRepository libroRepository;
    private final AquilarRepository aquilarRepository;

    public AquilarRestController(LibroRepository libroRepository, AquilarRepository aquilarRepository) {
        this.libroRepository = libroRepository;
        this.aquilarRepository = aquilarRepository;
    }

    /*Lista todos los libros*/
    @GetMapping
    public ResponseEntity<List<Libro>> listAll() {
        return ResponseEntity.ok(libroRepository.findAll());
    }

}
