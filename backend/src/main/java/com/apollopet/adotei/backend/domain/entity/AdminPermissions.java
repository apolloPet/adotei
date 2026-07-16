package com.apollopet.adotei.backend.domain.entity;

import java.util.Objects;

public class AdminPermissions {

    private boolean manageAnimals;
    private boolean approveAdoptions;
    private boolean manageSettings;
    private boolean manageAdmins;

    public AdminPermissions() {
    }

    public AdminPermissions(
        boolean manageAnimals,
        boolean approveAdoptions,
        boolean manageSettings,
        boolean manageAdmins
    ) {
        this.manageAnimals = manageAnimals;
        this.approveAdoptions = approveAdoptions;
        this.manageSettings = manageSettings;
        this.manageAdmins = manageAdmins;
    }

    public static AdminPermissions fullAccess() {
        return new AdminPermissions(true, true, true, true);
    }

    public static AdminPermissions defaultsForNewAdmin() {
        return new AdminPermissions(true, true, false, false);
    }

    public static AdminPermissions none() {
        return new AdminPermissions(false, false, false, false);
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

    public boolean allows(AdminPermission permission) {
        return switch (Objects.requireNonNull(permission)) {
            case MANAGE_ANIMALS -> manageAnimals;
            case APPROVE_ADOPTIONS -> approveAdoptions;
            case MANAGE_SETTINGS -> manageSettings;
            case MANAGE_ADMINS -> manageAdmins;
        };
    }
}
