package com.unir.biblioteca.elastic;

import com.unir.biblioteca.model.Libro;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibroElasticRepository extends ElasticsearchRepository<Libro, Long> {
    List<Libro> findByTituloContainingOrAutorContaining(String titulo, String autor);
}
