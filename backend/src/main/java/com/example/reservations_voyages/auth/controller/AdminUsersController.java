package com.example.reservations_voyages.auth.controller;

import com.example.reservations_voyages.auth.dto.UserCreateRequest;
import com.example.reservations_voyages.auth.dto.UserResponse;
import com.example.reservations_voyages.auth.dto.UserUpdateRequest;
import com.example.reservations_voyages.auth.service.AdminUsersService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUsersController {

    private final AdminUsersService service;

    public AdminUsersController(AdminUsersService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public UserResponse create(@RequestBody @Valid UserCreateRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @RequestBody @Valid UserUpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PatchMapping("/{id}/enabled")
    public UserResponse setEnabled(@PathVariable Long id, @RequestParam boolean value) {
        return service.setEnabled(id, value);
    }
}
