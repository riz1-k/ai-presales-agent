import { useCallback, useEffect, useState } from "react";
import {
	getSettings,
	SETTINGS_STORAGE_KEY,
	type Settings,
	saveSettings,
} from "@/lib/settings";

export function useSettings() {
	const [settings, setSettings] = useState<Settings>(getSettings());

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === SETTINGS_STORAGE_KEY) {
				setSettings(getSettings());
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, []);

	const updateSettings = useCallback(
		(newSettings: Partial<Settings> | ((prev: Settings) => Settings)) => {
			setSettings((prev) => {
				const updated =
					typeof newSettings === "function"
						? newSettings(prev)
						: { ...prev, ...newSettings };
				saveSettings(updated);
				return updated;
			});
		},
		[],
	);

	return { settings, updateSettings };
}
