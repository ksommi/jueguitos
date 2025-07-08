import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/countries";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function generateRandomCountry() {
	try {
		if (!COUNTRIES || COUNTRIES.length === 0) {
			console.error("COUNTRIES array is empty or undefined");
			return null;
		}

		// Obtener los últimos 7 países para evitar repeticiones inmediatas
		const { data: recentCountries } = await supabaseAdmin
			.from("daily_countries")
			.select("country_name, country_code")
			.order("date", { ascending: false })
			.limit(7);

		const recentCountryCodes =
			recentCountries?.map((c) => c.country_code) || [];

		// Filtrar países que no hayan aparecido recientemente
		const availableCountries = COUNTRIES.filter(
			(country) => !recentCountryCodes.includes(country.code)
		);

		// Si no hay países disponibles (muy improbable), usar todos
		const countriesToChooseFrom =
			availableCountries.length > 0 ? availableCountries : COUNTRIES;

		// Generar índice completamente aleatorio
		const randomIndex = Math.floor(
			Math.random() * countriesToChooseFrom.length
		);
		const selectedCountry = countriesToChooseFrom[randomIndex];

		if (!selectedCountry || !selectedCountry.name || !selectedCountry.code) {
			console.error("Selected country is invalid:", selectedCountry);
			return null;
		}

		return selectedCountry;
	} catch (error) {
		console.error("Error in generateRandomCountry:", error);
		return null;
	}
}

export async function GET() {
	try {
		const today = new Date().toISOString().split("T")[0];

		// Verificar si ya existe un país para hoy
		const { data: existing, error: existingError } = await supabaseAdmin
			.from("daily_countries")
			.select("*")
			.eq("date", today)
			.single();

		if (existing && !existingError) {
			return NextResponse.json({ success: true, data: existing });
		}

		// Si no existe, generar uno nuevo aleatorio
		const newCountry = await generateRandomCountry();

		if (!newCountry) {
			return NextResponse.json(
				{ success: false, error: "Failed to generate country" },
				{ status: 500 }
			);
		}

		// Insertar en la base de datos usando el service role
		const { data, error } = await supabaseAdmin
			.from("daily_countries")
			.insert([
				{
					date: today,
					country_name: newCountry.name,
					country_code: newCountry.code,
				},
			])
			.select()
			.single();

		if (error) {
			console.error("Error creating daily country:", error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data });
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// POST para forzar la generación de un nuevo país del día
export async function POST() {
	try {
		const today = new Date().toISOString().split("T")[0];

		// Eliminar el país existente de hoy si existe
		await supabaseAdmin.from("daily_countries").delete().eq("date", today);

		// Generar un nuevo país aleatorio
		const newCountry = await generateRandomCountry();

		if (!newCountry) {
			return NextResponse.json(
				{ success: false, error: "Failed to generate country" },
				{ status: 500 }
			);
		}

		// Insertar el nuevo país
		const { data, error } = await supabaseAdmin
			.from("daily_countries")
			.insert([
				{
					date: today,
					country_name: newCountry.name,
					country_code: newCountry.code,
				},
			])
			.select()
			.single();

		if (error) {
			console.error("Error creating daily country:", error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data,
			message: "New country generated!",
		});
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
