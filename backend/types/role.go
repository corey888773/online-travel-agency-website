package types

type Role string

const (
	AdminRole = "admin"
	UserRole  = "user"
)

func (r Role) String() string {
	return string(r)
}
