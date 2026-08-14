package com.apollopet.adotei.backend.domain.entity;

import java.util.Objects;

public class AdminPermissions {

    private boolean manageAnimals;
    private boolean approveAdoptions;
    private boolean manageSettings;
    private boolean manageAdmins;
    private boolean manageUsers;

    public AdminPermissions() {
    }

    public AdminPermissions(
        boolean manageAnimals,
        boolean approveAdoptions,
        boolean manageSettings,
        boolean manageAdmins,
        boolean manageUsers
    ) {
        this.manageAnimals = manageAnimals;
        this.approveAdoptions = approveAdoptions;
        this.manageSettings = manageSettings;
        this.manageAdmins = manageAdmins;
        this.manageUsers = manageUsers;
    }

    public static AdminPermissions fullAccess() {
        return new AdminPermissions(true, true, true, true, true);
    }

    public static AdminPermissions defaultsForNewAdmin() {
        return new AdminPermissions(true, true, false, false, false);
    }

    public static AdminPermissions defaultsForVolunteer() {
        return new AdminPermissions(true, true, false, false, false);
    }

    public static AdminPermissions none() {
        return new AdminPermissions(false, false, false, false, false);
    }

    /** Permissoes efetivas do usuario: registros antigos (sem json) mantem o comportamento anterior. */
    public static AdminPermissions effectiveFor(AppUser user) {
        AdminPermissions stored = user.getAdminPermissions();
        if (stored != null) {
            return stored;
        }
        return switch (user.getUserType()) {
            case ADMIN -> fullAccess();
            case VOLUNTARIO -> defaultsForVolunteer();
            default -> none();
        };
    }

    public boolean isManageAnimals() {
        return manageAnimals;
    }

    public void setManageAnimals(boolean manageAnimals) {
        this.manageAnimals = manageAnimals;
    }

    public boolean isApproveAdoptions() {
        return approveAdoptions;
    }

    public void setApproveAdoptions(boolean approveAdoptions) {
        this.approveAdoptions = approveAdoptions;
    }

    public boolean isManageSettings() {
        return manageSettings;
    }

    public void setManageSettings(boolean manageSettings) {
        this.manageSettings = manageSettings;
    }

    public boolean isManageAdmins() {
        return manageAdmins;
    }

    public void setManageAdmins(boolean manageAdmins) {
        this.manageAdmins = manageAdmins;
    }

    public boolean isManageUsers() {
        return manageUsers;
    }

    public void setManageUsers(boolean manageUsers) {
        this.manageUsers = manageUsers;
    }

    public boolean allows(AdminPermission permission) {
        return switch (Objects.requireNonNull(permission)) {
            case MANAGE_ANIMALS -> manageAnimals;
            case APPROVE_ADOPTIONS -> approveAdoptions;
            case MANAGE_SETTINGS -> manageSettings;
            case MANAGE_ADMINS -> manageAdmins;
            case MANAGE_USERS -> manageUsers;
        };
    }
}
