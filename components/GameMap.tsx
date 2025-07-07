" use client";

import {
	MapContainer,
	TileLayer,
	GeoJSON,
	useMapEvents,
	useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef } from "react";
import { Country, getColorByDistance } from "@/lib/countries";
import { loadCountriesData } from "@/lib/geoData";

// Fix para los iconos de Leaflet en Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface GameMapProps {
	targetCountry: Country;
	guessedCountries: Array<{
		country: Country;
		distance: number;
	}>;
	onMapReady?: () => void;
	onCountryClick?: (country: Country) => void;
	highlightedCountry?: Country | null;
	zoomToCountry?: Country | null; // Nueva prop para controlar el zoom
}

// Componente para manejar eventos del mapa
function MapEventHandler() {
	useMapEvents({
		click: (e) => {
			console.log("Map clicked at:", e.latlng);
		},
	});
	return null;
}

// Componente para controlar el zoom a un país específico
function ZoomController({
	zoomToCountry,
	geoJsonData,
}: {
	zoomToCountry: Country | null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	geoJsonData: any;
}) {
	const map = useMap();
	const previousCountry = useRef<Country | null>(null);

	useEffect(() => {
		if (
			zoomToCountry &&
			geoJsonData &&
			zoomToCountry !== previousCountry.current
		) {
			// Buscar la feature del país en el GeoJSON
			const countryFeature = geoJsonData.features.find(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(feature: any) =>
					feature.properties.name.toLowerCase() ===
						zoomToCountry.name.toLowerCase() ||
					feature.properties.nameEn?.toLowerCase() ===
						zoomToCountry.name.toLowerCase()
			);

			if (countryFeature) {
				// Crear un layer temporal para obtener los bounds y el centro
				const layer = L.geoJSON(countryFeature);
				const bounds = layer.getBounds();
				const center = bounds.getCenter(); // Obtener el centro de los bounds

				// Usar setView con el centro calculado para un centrado más preciso
				map.setView([center.lat, center.lng], 3, {
					animate: true,
					duration: 1.0,
				});
			} else {
				// Fallback: zoom a las coordenadas del país con zoom más alejado
				map.setView([zoomToCountry.lat, zoomToCountry.lng], 2, {
					animate: true,
					duration: 1.0,
				});
			}

			previousCountry.current = zoomToCountry;
		}
	}, [zoomToCountry, geoJsonData, map]);

	return null;
}

export default function GameMap({
	targetCountry,
	guessedCountries,
	onMapReady,
	onCountryClick,
	highlightedCountry,
	zoomToCountry,
}: GameMapProps) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [geoJsonData, setGeoJsonData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			try {
				setLoading(true);
				const countries = await loadCountriesData();

				// Convertir a formato GeoJSON
				const geoJson = {
					type: "FeatureCollection",
					features: countries.map((country) => ({
						type: "Feature",
						properties: {
							name: country.nameEs,
							nameEn: country.name,
							id: country.id,
						},
						geometry: country.geometry,
					})),
				};

				setGeoJsonData(geoJson);

				if (onMapReady) {
					onMapReady();
				}
			} catch (error) {
				console.error("Error loading map data:", error);
			} finally {
				setLoading(false);
			}
		}

		loadData();
	}, [onMapReady]);

	// Función para encontrar un país por nombre
	const findCountryByName = (name: string): Country | null => {
		// Buscar primero en los países adivinados
		const guessed = guessedCountries.find(
			(g) => g.country.name.toLowerCase() === name.toLowerCase()
		);
		if (guessed) return guessed.country;

		// Si es el país objetivo
		if (targetCountry.name.toLowerCase() === name.toLowerCase()) {
			return targetCountry;
		}

		return null;
	};

	// Función para obtener el estilo de cada país
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const getCountryStyle = (feature: any) => {
		const countryName = feature.properties.name;
		const countryNameEn = feature.properties.nameEn;

		// Buscar si este país fue adivinado
		const guessedCountry = guessedCountries.find(
			(g) =>
				g.country.name.toLowerCase() === countryNameEn?.toLowerCase() ||
				g.country.name.toLowerCase() === countryName?.toLowerCase()
		);

		// Si el país no ha sido adivinado, hacerlo invisible
		if (!guessedCountry) {
			// Solo mostrar si es el país resaltado (para hover desde la lista)
			const isHighlighted =
				highlightedCountry &&
				(highlightedCountry.name.toLowerCase() ===
					countryNameEn?.toLowerCase() ||
					highlightedCountry.name.toLowerCase() ===
						countryName?.toLowerCase());

			if (!isHighlighted) {
				return {
					fillColor: "transparent",
					fillOpacity: 0,
					color: "transparent",
					weight: 0,
					opacity: 0,
				};
			}
		}

		let fillColor = "#f3f4f6"; // Gris claro por defecto
		let fillOpacity = 0.6; // Opacidad para vista satelital
		let weight = 1;
		let color = "#d1d5db";

		if (guessedCountry) {
			fillColor = getColorByDistance(guessedCountry.distance);
			fillOpacity = 0.9; // Opacidad alta para vista satelital
			weight = 2;
			color = "#374151";
		}

		// Resaltar país seleccionado en la lista
		if (
			highlightedCountry &&
			(highlightedCountry.name.toLowerCase() ===
				countryNameEn?.toLowerCase() ||
				highlightedCountry.name.toLowerCase() ===
					countryName?.toLowerCase())
		) {
			weight = 4;
			color = "#1f2937";
			fillOpacity = 1.0; // Máxima opacidad para vista satelital
			// Si no ha sido adivinado pero está resaltado, mostrar en gris tenue
			if (!guessedCountry) {
				fillColor = "#e5e7eb";
				fillOpacity = 0.4; // Opacidad tenue para vista satelital
				weight = 2;
			}
		}

		// Resaltar país objetivo si ya fue adivinado correctamente
		if (
			guessedCountries.some(
				(g) =>
					g.country.name.toLowerCase() === targetCountry.name.toLowerCase()
			) &&
			(targetCountry.name.toLowerCase() === countryNameEn?.toLowerCase() ||
				targetCountry.name.toLowerCase() === countryName?.toLowerCase())
		) {
			fillColor = "#10b981"; // Verde para el país correcto
			fillOpacity = 1.0; // Máxima opacidad para vista satelital
			weight = 4;
			color = "#065f46";
		}

		return {
			fillColor,
			fillOpacity,
			color,
			weight,
			opacity: 1,
		};
	};

	// Función para manejar eventos de cada país
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onEachFeature = (feature: any, layer: any) => {
		layer.on({
			click: () => {
				const countryName = feature.properties.name;
				const countryNameEn = feature.properties.nameEn;
				const country =
					findCountryByName(countryName) ||
					findCountryByName(countryNameEn);

				if (country && onCountryClick) {
					onCountryClick(country);
				} else {
					// Mostrar información del país aunque no haya sido adivinado
					console.log(`Clicked on: ${countryName} (${countryNameEn})`);
				}
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mouseover: (e: any) => {
				const layer = e.target;
				layer.setStyle({
					weight: 4,
					color: "#1f2937",
					dashArray: "",
					fillOpacity: 0.9,
				});
				layer.bringToFront();
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mouseout: (e: any) => {
				const layer = e.target;
				const originalStyle = getCountryStyle(feature);
				layer.setStyle(originalStyle);
			},
		});

		// Tooltip con información del país - solo si ya fue adivinado
		const countryName = feature.properties.name;
		const countryNameEn = feature.properties.nameEn;

		const guessedCountry = guessedCountries.find(
			(g) =>
				g.country.name.toLowerCase() === countryNameEn?.toLowerCase() ||
				g.country.name.toLowerCase() === countryName?.toLowerCase()
		);

		// Solo mostrar tooltip si el país ya fue adivinado
		if (guessedCountry) {
			let tooltipContent = `<strong>${countryName}</strong>`;
			if (countryNameEn && countryNameEn !== countryName) {
				tooltipContent += `<br/><em>${countryNameEn}</em>`;
			}
			tooltipContent += `<br/>Distancia: ${guessedCountry.distance.toLocaleString()} km`;

			layer.bindTooltip(tooltipContent, {
				permanent: false,
				direction: "center",
				className: "country-tooltip",
			});
		}
	};

	if (loading) {
		return (
			<div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg border-2 border-gray-200 flex items-center justify-center">
				<div className="text-gray-600">Cargando mapa...</div>
			</div>
		);
	}

	return (
		<div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-600">
			<style jsx global>{`
				.country-tooltip {
					background: rgba(0, 0, 0, 0.8) !important;
					color: white !important;
					border: none !important;
					border-radius: 4px !important;
					font-size: 12px !important;
					padding: 8px !important;
				}

				.leaflet-control-attribution {
					display: none !important;
				}

				.leaflet-tile-pane {
					filter: grayscale(20%) contrast(1.1);
				}

				/* Asegurar que el contenedor de Leaflet ocupe todo el espacio */
				.leaflet-container {
					width: 100% !important;
					height: 100% !important;
					border-radius: 0.5rem;
				}
			`}</style>

			<MapContainer
				center={[20, 0]}
				zoom={2}
				className="w-full h-full"
				zoomControl={true}
				scrollWheelZoom={true}
				attributionControl={false}
				worldCopyJump={false}
				maxBounds={[
					[-90, -180], // Esquina suroeste (latitud mínima, longitud mínima)
					[90, 180], // Esquina noreste (latitud máxima, longitud máxima)
				]}
				maxBoundsViscosity={1.0}
				minZoom={1}
				maxZoom={10}
			>
				{/* Vista satelital únicamente */}
				<TileLayer
					url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
					attribution=""
				/>

				{/* Capa de países */}
				{geoJsonData && (
					<GeoJSON
						key={`${guessedCountries.length}-${
							highlightedCountry?.name || "none"
						}-satellite`}
						data={geoJsonData}
						style={getCountryStyle}
						onEachFeature={onEachFeature}
					/>
				)}

				{/* Controlador de zoom */}
				<ZoomController
					zoomToCountry={zoomToCountry || null}
					geoJsonData={geoJsonData}
				/>

				<MapEventHandler />
			</MapContainer>
		</div>
	);
}
