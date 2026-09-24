// lib/maintenance.ts

import clientPromise from "@/lib/mongodb";

const COLLECTION_NAME = "applicationSettings";
const MAINTENANCE_ID = "maintenance";

export interface MaintenanceSettings {
    _id: string;
    maintenanceMode: boolean;
    message: string;
    updatedAt: Date;
    updatedBy?: {
        id: string;
        name?: string;
        email?: string;
    };
}

const DEFAULT_MESSAGE =
    "The application is currently undergoing maintenance. Please check back later.";

async function getSettingsCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    return db.collection<MaintenanceSettings>(COLLECTION_NAME);
}

/**
 * Get the current application maintenance settings.
 *
 * If no settings document exists yet, maintenance mode is considered OFF.
 */
export async function getMaintenanceSettings(): Promise<MaintenanceSettings> {
    const collection = await getSettingsCollection();

    const settings = await collection.findOne({
        _id: MAINTENANCE_ID,
    });

    if (!settings) {
        return {
            _id: MAINTENANCE_ID,
            maintenanceMode: false,
            message: DEFAULT_MESSAGE,
            updatedAt: new Date(0),
        };
    }

    return settings;
}

/**
 * Check whether the application is currently in maintenance mode.
 */
export async function isMaintenanceMode(): Promise<boolean> {
    const settings = await getMaintenanceSettings();

    return settings.maintenanceMode;
}

/**
 * Enable application maintenance mode.
 */
export async function enableMaintenanceMode(
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
    },
    message?: string
): Promise<MaintenanceSettings> {
    const collection = await getSettingsCollection();

    const now = new Date();

    const settings: MaintenanceSettings = {
        _id: MAINTENANCE_ID,
        maintenanceMode: true,
        message: message?.trim() || DEFAULT_MESSAGE,
        updatedAt: now,
        updatedBy: {
            id: user.id,
            name: user.name ?? undefined,
            email: user.email ?? undefined,
        },
    };

    await collection.replaceOne(
        {
            _id: MAINTENANCE_ID,
        },
        settings,
        {
            upsert: true,
        }
    );

    return settings;
}

/**
 * Update the maintenance message without changing maintenance mode.
 */
export async function updateMaintenanceMessage(
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
    },
    message: string
): Promise<MaintenanceSettings> {
    const collection = await getSettingsCollection();

    const currentSettings = await getMaintenanceSettings();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
        throw new Error("Maintenance message cannot be empty.");
    }

    const now = new Date();

    const settings: MaintenanceSettings = {
        ...currentSettings,
        maintenanceMode: currentSettings.maintenanceMode,
        message: trimmedMessage,
        updatedAt: now,
        updatedBy: {
            id: user.id,
            name: user.name ?? undefined,
            email: user.email ?? undefined,
        },
    };

    await collection.replaceOne(
        {
            _id: MAINTENANCE_ID,
        },
        settings,
        {
            upsert: true,
        }
    );

    return settings;
}

/**
 * Disable application maintenance mode.
 */
export async function disableMaintenanceMode(
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
    }
): Promise<MaintenanceSettings> {
    const collection = await getSettingsCollection();

    const currentSettings = await getMaintenanceSettings();

    const now = new Date();

    const settings: MaintenanceSettings = {
        ...currentSettings,
        maintenanceMode: false,
        updatedAt: now,
        updatedBy: {
            id: user.id,
            name: user.name ?? undefined,
            email: user.email ?? undefined,
        },
    };

    await collection.replaceOne(
        {
            _id: MAINTENANCE_ID,
        },
        settings,
        {
            upsert: true,
        }
    );

    return settings;
}