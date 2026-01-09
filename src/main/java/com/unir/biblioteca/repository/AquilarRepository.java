package com.unir.biblioteca.repository;

import com.unir.biblioteca.model.Aquilar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AquilarRepository extends JpaRepository<Aquilar,Long> {
}
