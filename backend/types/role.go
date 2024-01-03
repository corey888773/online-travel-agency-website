package types

type Role string

const (
	Admin Role = "admin"
	User  Role = "user"
)

func (r Role) String() string {
	return string(r)
}
