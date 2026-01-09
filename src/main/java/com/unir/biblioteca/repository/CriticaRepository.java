package com.unir.biblioteca.repository;

import com.unir.biblioteca.model.Critica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CriticaRepository extends JpaRepository<Critica,Long> {
    List<Critica> findByLibroIdOrderByFechaDesc(Long libroId);
}
