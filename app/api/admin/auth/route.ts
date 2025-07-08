import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { password } = await request.json();

		// La contraseña se mantiene en el servidor, NO expuesta al cliente
		const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "dlgp1449";

		if (password === ADMIN_PASSWORD) {
			return NextResponse.json({
				success: true,
				message: "Autenticación exitosa",
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					message: "Contraseña incorrecta",
				},
				{ status: 401 }
			);
		}
	} catch {
		return NextResponse.json(
			{
				success: false,
				message: "Error del servidor",
			},
			{ status: 500 }
		);
	}
}
