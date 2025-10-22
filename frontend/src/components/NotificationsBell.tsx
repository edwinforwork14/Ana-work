import * as React from "react";
import useNotifications from "../hooks/useNotifications";
const { useEffect, useRef, useState } = React;

type Notification = {
	id: string;
	title: string;
	description?: string;
	time?: string;
	read?: boolean;
};

export default function NotificationsBell() {
	const [open, setOpen] = useState(false);
	const [hiddenIds, setHiddenIds] = useState<string[]>([]);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const { notifs, loading, fetchNotifs, markAsRead } = useNotifications();
	// notifs comes from the backend (shape: { id, tipo, mensaje, leida, creada_en })
	// Map them to the component Notification shape and format creada_en as local datetime
	const mappedNotifs: Notification[] = (Array.isArray(notifs) ? notifs : []).map((n: any) => ({
		id: String(n.id),
		// show only the message text as the title
		title: n.mensaje || n.tipo || 'Notificación',
		// time will be relative in hours (e.g. '1h')
		time: n.creada_en ? hoursAgo(n.creada_en) : undefined,
		read: !!n.leida,
	}));

	useEffect(() => {
		function onDocumentClick(e: MouseEvent) {
			if (!containerRef.current) return;
			if (containerRef.current.contains(e.target as Node)) return;
			setOpen(false);
		}

		document.addEventListener("click", onDocumentClick);
		return () => document.removeEventListener("click", onDocumentClick);
	}, []);

	// Filter out locally hidden notifications
	const visibleNotifs: Notification[] = mappedNotifs.filter(n => !hiddenIds.includes(String(n.id)));
	const unreadCount = visibleNotifs.filter((n) => !n.read).length;


	function removeNotification(id: string) {
		// Only hide locally (no delete endpoint implemented). This keeps the UI responsive.
		setHiddenIds(prev => [...prev, id]);
	}

	function hoursAgo(dateLike: string | Date) {
		const d = new Date(dateLike);
		if (isNaN(d.getTime())) return '';
		let diffHours = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
		if (diffHours < 0) diffHours = 0; // future dates shown as 0h
		return `${diffHours}h`;
	}

	return (
		<div className="relative" ref={containerRef}>
			<button
				onClick={() => setOpen((v) => !v)}
				aria-label="Notificaciones"
				className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
			>
				{/* Bell SVG */}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6 text-gray-700 dark:text-gray-200"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.5}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
					/>
				</svg>

				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 shadow-lg rounded-md z-50">
					<div className="flex items-center justify-between px-4 py-2 border-b dark:border-neutral-800">
						<div className="text-sm font-medium text-gray-900 dark:text-gray-100">Notificaciones</div>
						<div className="flex items-center space-x-2">
							<button
								onClick={() => setOpen(false)}
								className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
							>
								Cerrar
							</button>
						</div>
					</div>

					<div className="max-h-64 overflow-y-auto">
						{loading && <div className="p-4 text-sm text-gray-500">Cargando...</div>}
						{!loading && visibleNotifs.length === 0 && (
							<div className="p-4 text-sm text-gray-500">No hay notificaciones</div>
						)}

						{visibleNotifs.map((n) => (
							<div
								key={n.id}
								className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800 border-b last:border-b-0"
							>
								<div className="flex-shrink-0 mt-1">
									<span
										className={`inline-block h-2 w-2 rounded-full ${n.read ? "bg-gray-300" : "bg-blue-500"}`}
										aria-hidden
									/>
								</div>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{n.title}</div>
										<div className="text-xs text-gray-400">{n.time}</div>
									</div>
								</div>
								<div className="flex-shrink-0 pl-2 flex flex-col items-end space-y-1">
									<button
										onClick={async () => { await markAsRead(n.id); fetchNotifs(); }}
										className="text-xs text-blue-600 hover:underline"
										aria-label={`Marcar notificación ${n.title} como leída`}
									>
										Marcar leída
									</button>
									<button
										onClick={() => removeNotification(n.id)}
										className="text-xs text-red-500 hover:text-red-700"
										aria-label={`Eliminar notificación ${n.title}`}
									>
										Eliminar
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
