import jwt from "jsonwebtoken";

export const authCompany = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Authorization token missing" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      company_id: payload.company_id,
      plan_id: payload.plan_id,
      email: payload.email,
      name: payload.name
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};
