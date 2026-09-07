import clientPromise from "../lib/mongodb";

const fieldOfficers = [
    {
        foId: "FO 1",
        name: "Anna Ogar",
    },
    {
        foId: "FO 2",
        name: "Halima Oseni",
    },
    {
        foId: "FO 3",
        name: "Henry Olu-Adewale",
    },
    {
        foId: "FO 4",
        name: "Madina Ibrahim",
    },
    {
        foId: "FO 5",
        name: "Maryam Sadisu",
    },
    {
        foId: "FO 6",
        name: "Nasir Wada",
    },
];

async function seedFieldOfficers() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    for (const officer of fieldOfficers) {
        await db.collection("field_officers").updateOne(
            { foId: officer.foId },
            {
                $set: {
                    name: officer.name,
                    isActive: true,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    foId: officer.foId,
                    createdAt: new Date(),
                },
            },
            { upsert: true }
        );
    }

    console.log("Field officers seeded successfully.");

    await client.close();
}

seedFieldOfficers().catch((error) => {
    console.error("Field officer seeding failed:", error);
    process.exit(1);
});