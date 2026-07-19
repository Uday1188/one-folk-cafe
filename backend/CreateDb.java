import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class CreateDb {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/postgres", "postgres", "root");
            Statement stmt = conn.createStatement();
            stmt.executeUpdate("CREATE DATABASE friendscafe");
            System.out.println("Database friendscafe created successfully!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
