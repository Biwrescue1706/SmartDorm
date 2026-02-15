export const deleteSlip = async (url) => {
  try {
    if (!url) return;

    const fileName = url.split("/").pop();
    const path = `Payment-slips/${fileName}`;

    await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .remove([path]);

  } catch (err) {
    console.warn("ลบสลิปไม่สำเร็จ:", err);
  }
};