function getRecommendations(stade) {
    const recommendations = {
        1: "Surveillance annuelle",
        2: "Surveillance bi-annuelle", 
        3: "Suivi trimestriel + contrôle tension",
        4: "Consultation néphrologue urgente",
        5: "Dialyse nécessaire"
    };
    return recommendations[stade] || "Suivi standard";
}

window.generatePatientReport = async function(patient) {
    try {
        if (!patient?.nom) throw new Error("Patient invalide");

        const { PDFDocument, StandardFonts, rgb } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]);

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const content = [
            { text: "RAPPORT MÉDICAL AI4CKD", y: 800, size: 20, font: fontBold },
            { text: `Nom: ${patient.nom}`, y: 750 },
            { text: `Prénom: ${patient.prenom || 'N/A'}`, y: 730 },
            { text: `Âge: ${patient.age || 'N/A'}`, y: 710 },
            { text: `Stade MRC: ${patient.stadeMRC || 'N/A'}`, y: 690 },
            { text: `Dernier examen: ${patient.dernierExamen || 'N/A'}`, y: 670 },
            { text: `Recommandations: ${getRecommendations(patient.stadeMRC)}`, y: 650, font: fontBold }
        ];

        content.forEach(item => {
            page.drawText(item.text, {
                x: 50,
                y: item.y,
                size: item.size || 12,
                font: item.font || font
            });
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `Rapport_${patient.nom}.pdf`;
        a.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 100);

    } catch (error) {
        console.error("Erreur génération PDF:", error);
        alert("Échec de génération: " + error.message);
    }
};
